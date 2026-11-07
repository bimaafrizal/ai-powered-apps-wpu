"use server";

import { ENVIRONMENT } from "@/config/environment";
import { createAI } from "./instance";

export async function generateEmbedding(contents: string) {
  const ai = createAI();

  try {
    const response = await ai.models.embedContent({
      model: ENVIRONMENT.AI_EMBEDDING_MODEL,
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
