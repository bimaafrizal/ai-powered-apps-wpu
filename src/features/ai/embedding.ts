"use server";

import { ENVIRONMENT } from "@/config/environment";
import { createAI } from "./instance";
import { Conversation } from "@/app/types/ai";
import { createClient } from "@supabase/supabase-js";

export async function generateEmbedding(contents: string) {
  const ai = createAI();

  try {
    const response = await ai.models.embedContent({
      model: ENVIRONMENT.AI_EMBEDDING_MODEL ?? "gemini-embedding-2",
      contents,
      config: {
        outputDimensionality: 1536,
      },
    });

    if (
      !response.embeddings ||
      response.embeddings.length === 0 ||
      !response.embeddings[0].values
    ) {
      throw new Error("Failed to generate embedding");
    }

    return response.embeddings[0].values;
  } catch (error) {
    throw error;
  }
}

export async function retriveEmbedding(
  query: string,
  historyChat?: Conversation[],
  isThinking?: boolean,
) {
  const ai = createAI();

  const supabase = await createClient;

  try {
  } catch (error) {}
}
