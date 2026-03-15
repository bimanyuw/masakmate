import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  dedupeRecipes,
  fetchRecipesFromSpoonacular,
} from "@/lib/recipeApiFallback";

type GenerateRecipeBody = {
  ingredients?: string;
  count?: number;
  regenerate?: boolean;
  seed?: number;
  namingStyle?: string;
  language?: string;
};

type RecipeItem = {
  nama_menu?: string;
  vibe_check?: string;
  estimasi_waktu?: string;
  estimasi_budget?: string;
  bahan_bahan?: string[];
  langkah_masak?: string[];
  info_gizi?: {
    kalori?: string;
    protein?: string;
    karbo?: string;
    lemak?: string;
  };
  tips_bestie?: string;
  dalle_prompt?: string;
  source?: "ai" | "external";
};

type RecipeResponse = {
  rekomendasi_menu?: RecipeItem[];
};

export async function POST(req: Request) {
  const requestId = Math.random().toString(36).slice(2, 8);

  try {
    const body = (await req.json()) as GenerateRecipeBody;

    const ingredients = body.ingredients?.trim() ?? "";
    const requestedCount = Math.min(Math.max(body.count ?? 10, 1), 10);
    const regenerate = body.regenerate ?? false;
    const seed = body.seed ?? Date.now();
    const namingStyle = body.namingStyle ?? "classy-minimal-fine-dining";
    const language = body.language === "indonesian" ? "indonesian" : "english";

    if (!ingredients) {
      return NextResponse.json(
        { error: "Ingredients are required." },
        { status: 400 }
      );
    }

    const totalCount = requestedCount;
    const aiTargetCount = Math.min(4, totalCount);
    const externalTargetCount = totalCount - aiTargetCount;

    let aiRecipes: RecipeItem[] = [];
    let aiError: string | null = null;
    let externalError: string | null = null;

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);

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
Generate exactly ${aiTargetCount} distinct recipe recommendations from these ingredients:
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
- Generate EXACTLY ${aiTargetCount} recipes.
- Use mostly the user's ingredients.
- You may add basic pantry staples only: salt, pepper, oil, butter, water, sugar, soy sauce.
- Favor practical cooking methods.
- Target roughly 15 to 25 minutes.
- Keep the dishes realistic and cookable at home.
- All fields must be written in ${language}.

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
        `.trim();

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        let parsed: unknown;

        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        }

        const data = parsed as RecipeResponse;

        if (!data?.rekomendasi_menu || !Array.isArray(data.rekomendasi_menu)) {
          throw new Error("Model returned an invalid JSON structure.");
        }

        aiRecipes = data.rekomendasi_menu.slice(0, aiTargetCount).map((item) => ({
          nama_menu: item.nama_menu ?? "Seasonal Home Plate",
          vibe_check: item.vibe_check ?? "Clean, warm, and balanced.",
          estimasi_waktu: item.estimasi_waktu ?? "20 min",
          estimasi_budget: item.estimasi_budget ?? "Rp18.000 - Rp35.000",
          bahan_bahan: Array.isArray(item.bahan_bahan) ? item.bahan_bahan : [],
          langkah_masak: Array.isArray(item.langkah_masak) ? item.langkah_masak : [],
          info_gizi: {
            kalori: item.info_gizi?.kalori ?? "350 kcal",
            protein: item.info_gizi?.protein ?? "18 g",
            karbo: item.info_gizi?.karbo ?? "28 g",
            lemak: item.info_gizi?.lemak ?? "14 g",
          },
          tips_bestie:
            item.tips_bestie ??
            "Taste once more before serving for a better balance.",
          dalle_prompt:
            item.dalle_prompt ??
            `A realistic plated food photograph of ${
              item.nama_menu ?? "a refined home-style dish"
            }, elegant modern presentation, soft natural lighting, neutral ceramic plate, editorial food photography, highly detailed.`,
          source: "ai",
        }));
      } catch (error) {
        aiError = error instanceof Error ? error.message : "Unknown AI error";
        console.error(`[${requestId}] AI generation failed:`, error);
      }
    } else {
      aiError = "GEMINI_API_KEY is missing";
    }

    let externalRecipes: RecipeItem[] = [];

    try {
      externalRecipes = await fetchRecipesFromSpoonacular(
        ingredients,
        Math.max(externalTargetCount, totalCount - aiRecipes.length)
      );
    } catch (error) {
      externalError =
        error instanceof Error ? error.message : "Unknown external API error";
      console.error(`[${requestId}] Spoonacular failed:`, error);
    }

    const merged = dedupeRecipes([...aiRecipes, ...externalRecipes]).slice(
      0,
      totalCount
    );

    if (merged.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to generate recipes.",
          detail: "Both Gemini and Spoonacular failed.",
          meta: {
            ai_error: aiError,
            external_error: externalError,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        rekomendasi_menu: merged,
        meta: {
          requested_count: totalCount,
          ai_count: merged.filter((r) => r.source === "ai").length,
          external_count: merged.filter((r) => r.source === "external").length,
          ai_error: aiError,
          external_error: externalError,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to generate recipes.",
        detail: message,
      },
      { status: 500 }
    );
  }
}