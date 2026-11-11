"use server";

import { ENVIRONMENT } from "@/config/environment";
import { createAI } from "./instance";
import { createClient } from "@/lib/supabase/server";

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

export async function findEmbedding(
  contents: string,
  match_threshold?: number,
  match_count?: number,
) {
  const supabase = await createClient();

  // embeding first before query
  const queryEmbedding = await generateEmbedding(contents);

  const { data, error } = await supabase.rpc("match_transactions", {
    query_embedding: queryEmbedding,
    match_threshold: match_threshold || 0.9,
    match_count: match_count || 1,
  });

  if (error) {
    throw new Error(`Failed to perform vector search: ${error.message}`);
  }

  return data ?? [];
}
