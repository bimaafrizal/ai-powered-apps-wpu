"use server";

import { ENVIRONMENT } from "@/config/environment";
import { GoogleGenAI } from "@google/genai";

const apiKey = ENVIRONMENT.GOOGLE_API_KEY;
const aiModel = ENVIRONMENT.AI_MODEL ?? "gemini-2.0-flash";

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function handleChat(message: string) {
  const response = await ai.models.generateContent({
    model: aiModel,
    contents: message,
    config: {},
  });

  return response.text ?? "";
}
