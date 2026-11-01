import { ENVIRONMENT } from "@/config/environment";
import { GoogleGenAI } from "@google/genai";

export function createAI() {
  if (!ENVIRONMENT.GOOGLE_API_KEY) {
    throw new Error("AI API Key is missing");
  }
  const ai = new GoogleGenAI({
    apiKey: ENVIRONMENT.GOOGLE_API_KEY,
  });

  return ai;
}
