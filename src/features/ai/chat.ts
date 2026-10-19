"use server";

import { ENVIRONMENT } from "@/config/environment";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

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

export async function handleChatWithThinking(message: string) {
  const response = await ai.models.generateContent({
    model: aiModel,
    contents: message,
    config: {
      thinkingConfig: {
        includeThoughts: true,
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  const parts = response.candidates?.[0].content?.parts;
  if (!parts) {
    return;
  }

  const result = {
    thought: "",
    answer: "",
  };

  for (const part of parts) {
    if (!part.text) {
      continue;
    } else if (part.thought) {
      result.thought += part.text;
    } else {
      result.answer += part.text;
    }
  }

  return result;
}
