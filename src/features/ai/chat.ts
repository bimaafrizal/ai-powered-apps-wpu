"use server";

import { Conversation } from "@/app/types/ai";
import { ENVIRONMENT } from "@/config/environment";
import { ThinkingLevel } from "@google/genai";
import { createAI } from "./instance";
import { Transaction } from "@/app/types/transaction";
import { createClient } from "@/lib/supabase/server";
import { findEmbedding, generateEmbedding } from "./embedding";

const aiModel = ENVIRONMENT.AI_MODEL;

export async function handleChat(
  conversation: Conversation[],
  isThinking: boolean,
) {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: aiModel,
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

async function generalChat(conversation: Conversation[], isThinking?: boolean) {
  const ai = createAI();
  const response = await ai.models.generateContentStream({
    model: aiModel,
    contents: [...conversation],
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
        thinkingLevel: isThinking ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
      },
      systemInstruction: `
      [Role]
      Kamu adalah Finabot seorang financial advisor, yang punya gaya bahasa sopan dan suka
      memberikan analogi sehari-hari agar penjelasan rumit jadi lebih mudah dipahami.

      [Instruction]
      - Jawab semua pertanyaan yang sesuai dengan bidang finance

      [Context]
      Kamu bekerja untuk Fina, platform financial tracker yang target utamanya adalah pengusaha di Indonesia (usia 18 - 30 tahun),
      dengan penghasilan UMR (Rp 3.000.000 - Rp 6.000.000). Kebanyakan dari mereka mulai memikirkan investasi.

      [Input]
      Pengguna akan menanyakan seputar menabung, investasi, pengelolaan utang, dana darurat atau pertanyaan lain seputar finance.

      [Constraints]
      - Jawab dengan bahasa Indonesia yang santai, sopan namun tetap profesional.
      - Jangan membuat asumsi tentang data dari pengguna jika mereka tidak menyebutkannya.
      - Cerita pengeluaran, pemasukan, belanja, atau kebiasaan uang sehari-hari tetap termasuk topik finance.
      - Jika ada pertanyaan diluar konteks terkait finance, maka kamu jawab bahwa kamu hanya bisa menjawab pertanyaan terkait finance.
      - Disclaimer "Saran ini bersifat rekomendasi, keputusan ada di tangan anda." HANYA ditulis di akhir jawaban
        jika jawaban berisi rekomendasi keuangan yang konkret (misalnya langkah menabung, alokasi budget, pilihan investasi, strategi bayar utang).
      - JANGAN tulis disclaimer jika jawaban hanya berupa sapaan, penolakan topik di luar finance, pertanyaan balik untuk menggali data,
        konfirmasi/tanggapan atas cerita pengguna, atau ajakan untuk bercerita.

      [Workflow Steps]
      - Langkah 1 (Information Extraction): Identifikasi pengguna, tanyakan usia, penghasilan/ budget, tujuan keuangannya.
      - Langkah 2 (Thought): Analisis masalah utama pengguna dan  data apa yang kurang.
      - Langkah 3 (Action): Tentukan rencana yang harus dijalankan.
      - Langkah 4 (Evaluation): Periksa kembali hasil dari action.
      - Langkah 5 (Response Generation): Keluarkan jawaban akhir ke pengguna
      
      [Response Format]
      Struktur jawaban kamu harus seperti ini:
      1. Analisis singkat masalah pengguna dalam 1 kalimat.
      2. Langkah solusi (hanya jika memang ada saran yang diberikan).
      3. Disclaimer (hanya jika ada langkah solusi/saran).

      [Example]
      ikuti gaya jawaban dari contoh berikut
      [Contoh 1]
      User: "Gaji saya 5 juta, gimana ccara nabung dana darurat"
      Model: "Mengumpulkan dana darurat dengan gaji 5 juta itu sangat mungkin asalkan konsisten.
      Berikut langkah awalnya:
      - Sisihkan minimal 10% di awal bulan.
      - Simpan di instrumen rendah resiko seperti RDPU
      Saran ini bersifat rekomendasi, keputusan ada di tangan anda."

      [Contoh 2]
      User: "Mending bayar utang paylater atau mulai investasi"
      Model: "Prioritas utama yang sehat adalah melunasi utang konsumtif dengan bunga tinggi.
      Ini saran untukmu:
      - Stop penggunaan paylater untuk sementara waktu.
      - Dana berlebih pakai untuk melunasi paylater tersebut karena bunga jauh lebih tinggi dari imbal hasil investasi.
      - Setelah lunas baru mulai rutin investasi
      Saran ini bersifat rekomendasi, keputusan ada di tangan anda."

      [Contoh 3 - tanpa saran, tanpa disclaimer]
      User: "Saya kemarin makan warteg 15000"
      Model: "Oke, pengeluaran makan Rp 15.000 di warteg kemarin, cukup hemat! Kalau mau, ceritakan budget makan bulananmu
      supaya saya bisa bantu cek apakah pengeluaranmu sudah ideal."

      [Contoh 4 - di luar topik, tanpa disclaimer]
      User: "Rekomendasi film horor dong"
      Model: "Maaf, saya hanya bisa membantu pertanyaan seputar keuangan seperti menabung, investasi, utang, atau dana darurat."
      `,
      // sampling params
      temperature: 0.2,
      topK: 5,
      topP: 0.9,
      // output control
      maxOutputTokens: 2048,
      stopSequences: ["\n\n\n", "###", "Pengguna:", "User:"],
      //repetition penalties
      // presencePenalty: 1.5, //
      // frequencyPenalty: 1.5, //semakin sering semakin dibuat
    },
  });

  return response;
}

async function personalizedChat(
  query: string,
  historyChat?: Conversation[],
  isThinking?: boolean,
) {
  const ai = createAI();

  // Threshold lebih rendah & count lebih besar: pertanyaan natural language
  // jarang punya similarity tinggi dengan teks JSON transaksi.
  const data = await findEmbedding(query, 0.5, 30);

  let contextData = "";
  if (!data || data.length === 0) {
    contextData =
      "No transactions found that are similar or relevant to the question.";
  } else {
    contextData = data
      .map((transaction: Transaction) => {
        return JSON.stringify(transaction);
      })
      .join("\n");
  }

  const prompt = `
    <role>
      You are an AI Financial Analyst. You are helping the user analyze 
      their financial data using the RAG (Retrieval-Augmented Generation) technique.
    </role>
    <input>
      Today's date: ${new Date().toISOString().slice(0, 10)}
      User Question: "${query}"
    </input>
    <context>
      Relevant Transaction data from the database (Ordered from most relevant):
      ${contextData}
    </context>
    <instruction>
      - Answer the user question ONLY based on the relevant transaction data above.
      - If there are calculations (total spending, average, etc), calculate them accurately based on the data.
      - Provide the answer in a neat, professional, yet easy-to-understand markdown format.
      - If there is no relevant data at all, state that the data is not availble in the history.
      - If user question is general and not need a data, response generally.
    </instruction>
    <constraints>
      - Don't answer in table format instead of markdown.
    </constraints>
  `;

  const response = await ai.models.generateContentStream({
    model: aiModel,
    contents: [
      ...(historyChat ?? []),
      { role: "user", parts: [{ text: prompt }] },
    ],
    config: {
      thinkingConfig: {
        includeThoughts: isThinking,
        thinkingLevel: isThinking ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
      },
    },
  });

  return response;
}

export async function* handleChatWithStream(
  conversation: Conversation[],
  isThinking: boolean,
  mode: "general" | "personalized",
) {
  let response;
  if (mode === "general") {
    response = await generalChat(conversation, isThinking);
  } else {
    response = await personalizedChat(
      conversation[conversation.length - 1].parts[0].text,
      conversation,
      isThinking,
    );
  }

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
