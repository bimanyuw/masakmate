import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum terbaca" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const { ingredients } = await req.json();

    if (!ingredients || !ingredients.trim()) {
      return NextResponse.json(
        { error: "Ingredients wajib diisi" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `
Kamu adalah Chef Bestie, asisten masak AI pribadi untuk ibu-ibu muda Gen Z.

Buat 3 ide masakan dari bahan berikut:
${ingredients}

Aturan:
- Prioritaskan one-pan atau one-pot
- Gunakan mayoritas bahan user
- Boleh tambahkan bumbu dasar dapur
- Maksimal 15-20 menit
- Berikan 3 menu yang berbeda
- Menu 1: paling sat-set
- Menu 2: paling hemat
- Menu 3: paling menarik / paling ngenyangin
- Jawaban HARUS valid JSON
- Jangan gunakan markdown
- Jangan tambahkan teks lain selain JSON

Format JSON:
{
  "rekomendasi_menu": [
    {
      "nama_menu": "string",
      "vibe_check": "string",
      "estimasi_waktu": "string",
      "estimasi_budget": "string",
      "bahan_bahan": ["string"],
      "langkah_masak": ["string"],
      "info_gizi": {
        "kalori": "string",
        "protein": "string",
        "karbo": "string",
        "lemak": "string"
      },
      "tips_bestie": "string",
      "dalle_prompt": "string"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, "").trim();
    const json = JSON.parse(clean);

    return NextResponse.json(json);
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return NextResponse.json(
      {
        error: "Gagal generate recipe",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}