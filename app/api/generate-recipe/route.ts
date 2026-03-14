import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

type GenerateRecipeBody = {
  ingredients?: string;
  count?: number;
  regenerate?: boolean;
  seed?: number;
  namingStyle?: string;
  language?: string;
};

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as GenerateRecipeBody;

    const ingredients = body.ingredients?.trim() ?? "";
    const count = Math.min(Math.max(body.count ?? 10, 1), 10);
    const regenerate = body.regenerate ?? false;
    const seed = body.seed ?? Date.now();
    const namingStyle = body.namingStyle ?? "classy-minimal-fine-dining";
    const language = body.language ?? "english";

    if (!ingredients) {
      return NextResponse.json(
        { error: "Ingredients are required." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: regenerate ? 0.95 : 0.8,
        topP: 0.9,
        topK: 40,
      },
    });

    const prompt = `
You are a refined AI culinary assistant.

Task:
Generate exactly ${count} distinct recipe recommendations from these ingredients:
${ingredients}

Context:
- Response language must be ${language}.
- Naming style must be ${namingStyle}.
- Regenerate mode: ${regenerate ? "true" : "false"}.
- Variation seed: ${seed}.

Rules:
- Return ONLY valid JSON.
- Do not wrap the response in markdown.
- Do not add commentary outside the JSON.
- Generate EXACTLY ${count} recipes.
- Use mostly the user's ingredients.
- You may add basic pantry staples only: salt, pepper, oil, butter, water, sugar, soy sauce.
- Favor practical cooking methods.
- Target roughly 15 to 25 minutes.
- Menu names must be elegant, restrained, and restaurant-appropriate.
- Avoid playful, exaggerated, overly casual, or “viral” style names.
- Keep the dishes realistic and cookable at home.
- All fields must be written in English.
- "vibe_check" should be short, tasteful, and elegant.
- "estimasi_waktu" should be in English, e.g. "20 min".
- "estimasi_budget" should be in Indonesian Rupiah format, e.g. "Rp18.000 - Rp35.000".
- "bahan_bahan" should remain simple ingredient lines, not yet structured.
- "langkah_masak" should be concise but clear.
- "tips_bestie" should sound like a chef note, not slangy.
- Do not mention Michelin or luxury directly in the output.

JSON format:
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
    const text = result.response.text().trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    const data = parsed as {
      rekomendasi_menu?: Array<{
        nama_menu: string;
        vibe_check: string;
        estimasi_waktu: string;
        estimasi_budget: string;
        bahan_bahan: string[];
        langkah_masak: string[];
        info_gizi: {
          kalori: string;
          protein: string;
          karbo: string;
          lemak: string;
        };
        tips_bestie: string;
        dalle_prompt: string;
      }>;
    };

    if (!data?.rekomendasi_menu || !Array.isArray(data.rekomendasi_menu)) {
      throw new Error("Model returned an invalid JSON structure.");
    }

    const normalized = {
      rekomendasi_menu: data.rekomendasi_menu.slice(0, count).map((item) => ({
        nama_menu: item.nama_menu ?? "Seasonal Composition",
        vibe_check: item.vibe_check ?? "A clean, balanced everyday plate.",
        estimasi_waktu: item.estimasi_waktu ?? "20 min",
        estimasi_budget:
          item.estimasi_budget ?? "Rp18.000 - Rp35.000",
        bahan_bahan: Array.isArray(item.bahan_bahan) ? item.bahan_bahan : [],
        langkah_masak: Array.isArray(item.langkah_masak)
          ? item.langkah_masak
          : [],
        info_gizi: {
          kalori: item.info_gizi?.kalori ?? "350 kcal",
          protein: item.info_gizi?.protein ?? "18 g",
          karbo: item.info_gizi?.karbo ?? "28 g",
          lemak: item.info_gizi?.lemak ?? "14 g",
        },
        tips_bestie:
          item.tips_bestie ??
          "Finish with a final taste adjustment before serving.",
        dalle_prompt:
          item.dalle_prompt ??
          `A realistic plated food photograph of ${item.nama_menu ?? "a refined dish"}, elegant modern presentation, soft natural lighting, neutral ceramic plate, editorial food photography, highly detailed.`,
      })),
    };

    if (normalized.rekomendasi_menu.length === 0) {
      throw new Error("No recipes were generated.");
    }

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to generate recipes.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}