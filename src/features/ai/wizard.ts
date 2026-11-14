"use server";

import z from "zod";
import { createAI } from "./instance";
import { format } from "date-fns";
import { ENVIRONMENT } from "@/config/environment";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../transaction/action";
import { findEmbedding } from "./embedding";
import {
  createTransactionDeclaration,
  deleteTransactionDeclaration,
  getTransactionDeclaration,
  updateTransactionDeclaration,
} from "./functionTransaction";
import { Content } from "@google/genai";

const transactionSchema = z.object({
  amount: z.number().default(0).describe("Transaction nominal"),
  type: z.enum(["income", "expense"]).describe("Type of Transaction"),
  category: z
    .enum([
      "Food & Drink",
      "Transportation",
      "Entertainment",
      "Shopping",
      "Housing",
      "Salary",
      "Other",
    ])
    .describe("Category of Transaction"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((date) => date <= format(new Date(), "yyyy-MM-dd"), {
      message: "Date cannot be in the future",
    })
    .describe(
      "Date of Transaction with format yyyy-MM-dd, if not provided, will use current date",
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .describe("Description of Transaction"),
});

export async function handleWizardInput(message: string) {
  const contents = `
  <role>
    You are an AI Wizard finance assitant, who can extract transaction details from text.
  </role>
  <instruction>
    Extract the transaction details from the following text and return it as a structure JSON object.
    The JSON object must have exactly these fields:
    - "amount": a number representing the cost (positive). Use 0 if not provided.
    - "type": type of transaction, either 'income' or 'expense'.
    - "category": choose the most appropriate category from this exact list:
                  'Food & Drink','Shopping','Housing','Transportation','Entertainment','Salary','Others'.
    - "description": a short string describing the transaction, first letter capitalized.
    - "date": date of transaction in YYYY-MM-DD format.
              Assume the current date if relative terms like 'today' or 'just now'. If not define use current date.
  </instruction>
  <context>
    Current Date : ${new Date().toISOString()}
  </context>
  <input>
    Text to extract: ${message}
  </input>
  <outputFormat>
    Respond with only the raw JSON object, no markdown blocks, no text before or after.
  </outputFormat>
  `;
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: ENVIRONMENT.AI_MODEL,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(transactionSchema),
    },
  });

  const transaction = transactionSchema.parse(JSON.parse(`${response.text}`));
  if (!transaction.date) {
    transaction.date = format(new Date(), "yyyy-MM-dd");
  }
  if (!transaction.amount) {
    transaction.amount = 0;
  }

  return transaction;
}

export async function handleWizardTools(message: string) {
  const contents: Content[] = [
    {
      role: "user",
      parts: [
        {
          text: `
    <role>
        You are an AI Wizard finance assitant, who can extract transaction details from text.
    </role>
    <instruction>
        - Extract the transaction details from the following text.
        - If request is to update or delete transaction, you must call function get_transaction first to find out which transaction will be updated or deleted.
        - When update transaction, args must return from get_transaction before with fully like in schema.
        - The final response if there are no more functions being called is as simple as possible.
    </instruction>
    <context>
        Current Date : ${new Date().toISOString()}
    </context>
    <input>
        Text to extract: ${message}
    </input>
  `,
        },
      ],
    },
  ];

  let iterate = 1;
  const ai = createAI();
  let running = true;
  while (running) {
    console.log(`iterate: ${iterate}`);
    console.log(contents);
    iterate++;
    const response = await ai.models.generateContent({
      model: ENVIRONMENT.AI_MODEL,
      contents,
      config: {
        tools: [
          {
            functionDeclarations: [
              getTransactionDeclaration,
              createTransactionDeclaration,
              deleteTransactionDeclaration,
              updateTransactionDeclaration,
            ],
          },
        ],
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      console.log("function call: ");
      console.log(response.functionCalls);

      if (response.candidates && response.candidates[0]?.content) {
        contents.push(response.candidates[0].content);
      }

      const functionResponseParts = await Promise.all(
        response.functionCalls.map(async (functionCall) => {
          const { name, args, id } = functionCall;
          if (!args) {
            throw new Error("No arguments provided");
          }

          let resultData = {};

          switch (name) {
            case "get_transaction":
              const dataFind = await findEmbedding(
                JSON.stringify(args),
                0.3,
                5,
              );
              resultData = dataFind[0] || {};
              break;
            case "create_transaction":
              const transaction = transactionSchema.parse(args);
              if (transaction.amount <= 0) {
                throw new Error(
                  "Cannot create transaction with invalid amount",
                );
              }
              await createTransaction(transaction);
              break;
            case "delete_transaction":
              await deleteTransaction(`${args.id}`);
              break;
            case "update_transaction":
              const newData = transactionSchema.parse(args);
              if (newData.amount === undefined || newData.amount <= 0) {
                throw new Error(
                  "Cannot update transaction with invalid amount",
                );
              }

              if (newData.amount <= 0) {
                throw new Error(
                  "Cannot update transaction with invalid amount",
                );
              }

              await updateTransaction(`${args.id}`, newData);
              break;
            default:
              throw new Error(`Unknown function call`);
          }

          return {
            functionResponse: {
              name,
              response: { result: resultData },
              id,
            },
          };
        }),
      );

      contents.push({
        role: "user",
        parts: functionResponseParts,
      });
    } else {
      running = false;
      return response.text;
    }
  }
}
