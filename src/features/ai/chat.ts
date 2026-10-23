"use server";

import { ENVIRONMENT } from "@/config/environment";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const apiKey = ENVIRONMENT.GOOGLE_API_KEY;
const aiModel = ENVIRONMENT.AI_MODEL ?? "gemini-2.0-flash";

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function handleChat(message: string, isThinking: boolean) {
  const response = await ai.models.generateContent({
    model: aiModel,
    contents: message,
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  const result = {
    thought: "",
    answer: "",
  };

  if (isThinking) {
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return;
    }

    for (const part of parts) {
      if (!part.text) {
        continue;
      } else if (part.thought) {
        result.thought += part.text;
      } else {
        result.answer += part.text;
      }
    }
  } else {
    result.answer = `${response.text}`;
  }

  return result;
}

export async function* handleChatWithStream(
  message: string,
  isThinking: boolean,
) {
  const response = await ai.models.generateContentStream({
    model: aiModel,
    contents: message,
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
        // thinkingLevel: isThinking ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
      },
    },
  });

  if (isThinking) {
    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) {
        return;
      }

      for (const part of parts) {
        if (!part.text) {
          continue;
        } else if (part.thought) {
          yield `[thought]${part.text}`;
        } else {
          yield part.text;
        }
      }
    }
  } else {
    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}
