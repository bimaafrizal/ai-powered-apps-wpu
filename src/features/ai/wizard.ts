"use server";

import z from "zod";
import { createAI } from "./instance";
import { format } from "date-fns";
import { ENVIRONMENT } from "@/config/environment";
import { FunctionDeclaration, Type } from "@google/genai";
import { createTransaction } from "../transaction/action";

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

// function declaration
const createTransactionDeclaration: FunctionDeclaration = {
  name: "create_transaction",
  description:
    "Create a new transaction in the user's financial history based on the provided message.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      amount: {
        type: Type.NUMBER,
        description: "The amount of the transaction",
      },
      type: {
        type: Type.STRING,
        enum: ["income", "expense"],
        description:
          'The type of the transaction, either "income" or "expense"',
      },
      category: {
        type: Type.STRING,
        enum: [
          "Food & Drink",
          "Shopping",
          "Housing",
          "Transportation",
          "Entertainment",
          "Salary",
          "Others",
        ],
        description: "The category of the transaction",
      },
      description: {
        type: Type.STRING,
        description: "A brief description of the transaction",
      },
      date: {
        type: Type.STRING,
        description: 'The date of the transaction in the format "YYYY-MM-DD"',
      },
    },
    required: ["amount", "description", "type", "category", "date"],
  },
};

export async function handleWizardTools(message: string) {
  const contents = `
  <role>
    You are an AI Wizard finance assitant, who can extract transaction details from text.
  </role>
  <instruction>
    Extract the transaction details from the following text.
  </instruction>
  <context>
    Current Date : ${new Date().toISOString()}
  </context>
  <input>
    Text to extract: ${message}
  </input>
  `;

  const response = await createAI().models.generateContent({
    model: ENVIRONMENT.AI_MODEL,
    contents,
    config: {
      tools: [
        {
          functionDeclarations: [createTransactionDeclaration],
        },
      ],
    },
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    switch (functionCall.name) {
      case "create_transaction":
        const args = functionCall.args;
        if (!args) {
          throw new Error("Function call arguments are missing");
        }
        const transaction = transactionSchema.parse(args);
        if (!transaction.date) {
          transaction.date = format(new Date(), "yyyy-MM-dd");
        }
        if (transaction.amount <= 0) {
          throw new Error("Transaction amount must be greater than 0");
        }

        await createTransaction(transaction);
        break;
    }
  } else {
    throw new Error("No function call detected in the AI response");
  }
}
