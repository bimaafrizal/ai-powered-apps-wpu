"use server";

import { Conversation } from "@/app/types/ai";
import { ENVIRONMENT } from "@/config/environment";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const apiKey = ENVIRONMENT.GOOGLE_API_KEY;
const aiModel = ENVIRONMENT.AI_MODEL ?? "gemini-2.0-flash";

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export async function handleChat(
  conversation: Conversation[],
  isThinking: boolean,
) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [...conversation],
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
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
  conversation: Conversation[],
  isThinking: boolean,
) {
  const response = await ai.models.generateContentStream({
    model: aiModel,
    contents: [...conversation],
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
        // thinkingLevel: isThinking ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
      },
      systemInstruction: `
      Kamu adalah seorang financial advisor. Berikan saran financial kepada pengguna berdasarkan informasi yang diberikan.

      [Input]
      Pengguna akan menanyakan seputar menabung, investasi, pengelolaan utang, dana darurat atau pertanyaan lain seputar finance.

      [Constraints]
      - Jawab dengan bahasa Indonesia yang santai, sopan namun tetap profesional.
      - Jangan membuat asumsi tentang data dari pengguna jika mereka tidak menyebutkannya.
      - Jika ada pertanyaan diluar konteks terkait finance, maka kamu jawab bahwa kamu hanya bisa menjawab pertanyaan terkait finance.
      - Jika memberikan saran diakhir jawaban tulis kalimat disclaimer "Saran ini bersifat rekomendasi, keputusan ada di tangan anda."
      
      [Response Format]
      Struktur jawaban kamu harus seperti ini:
      1. Analisis singkat masalah pengguna dalam 1 kalimat.
      2. Langkah solusi.
      `,
      // sampling params
      temperature: 0.2,
      topK: 5,
      topP: 0.9,
      // output control
      maxOutputTokens: 1024,
      stopSequences: ["\n\n\n", "###", "Pengguna:", "User:"],
      //repetition penalties
      // presencePenalty: 1.5, //
      // frequencyPenalty: 1.5, //semakin sering semakin dibuat
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
