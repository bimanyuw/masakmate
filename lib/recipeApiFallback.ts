type SpoonacularSearchItem = {
  id: number;
  title: string;
  image?: string;
  usedIngredientCount?: number;
  missedIngredientCount?: number;
  missedIngredients?: Array<{ name?: string }>;
  usedIngredients?: Array<{ name?: string }>;
};

type SpoonacularRecipeDetail = {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  nutrition?: {
    nutrients?: Array<{
      name?: string;
      amount?: number;
      unit?: string;
    }>;
  };
  analyzedInstructions?: Array<{
    steps?: Array<{
      number?: number;
      step?: string;
    }>;
  }>;
  extendedIngredients?: Array<{
    original?: string;
    name?: string;
  }>;
};

export type ExternalRecipe = {
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
  source: "external";
};

function normalizeIngredients(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",");
}

function getNutrientValue(
  nutrients: SpoonacularRecipeDetail["nutrition"] extends infer T
    ? T extends { nutrients?: infer U }
      ? U
      : never
    : never,
  targetName: string,
  fallback = "0 g"
) {
  const found = nutrients?.find(
    (n) => n.name?.toLowerCase() === targetName.toLowerCase()
  );

  if (!found || found.amount == null) return fallback;
  return `${Math.round(found.amount)} ${found.unit ?? ""}`.trim();
}

export async function fetchRecipesFromSpoonacular(
  ingredients: string,
  limit = 6
): Promise<ExternalRecipe[]> {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    throw new Error("SPOONACULAR_API_KEY is missing");
  }

  const normalizedIngredients = normalizeIngredients(ingredients);

  const searchUrl =
    `https://api.spoonacular.com/recipes/findByIngredients` +
    `?ingredients=${encodeURIComponent(normalizedIngredients)}` +
    `&number=${limit}` +
    `&ranking=1` +
    `&ignorePantry=true` +
    `&apiKey=${apiKey}`;

  const searchRes = await fetch(searchUrl, {
    method: "GET",
    cache: "no-store",
  });

  if (!searchRes.ok) {
    throw new Error(`Spoonacular search failed with status ${searchRes.status}`);
  }

  const searchData = (await searchRes.json()) as SpoonacularSearchItem[];

  if (!Array.isArray(searchData) || searchData.length === 0) {
    return [];
  }

  const detailResults = await Promise.all(
    searchData.slice(0, limit).map(async (item) => {
      const detailUrl =
        `https://api.spoonacular.com/recipes/${item.id}/information` +
        `?includeNutrition=true` +
        `&apiKey=${apiKey}`;

      const detailRes = await fetch(detailUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!detailRes.ok) {
        return null;
      }

      const detail = (await detailRes.json()) as SpoonacularRecipeDetail;

      const nutrients = detail.nutrition?.nutrients ?? [];
      const steps =
        detail.analyzedInstructions?.[0]?.steps
          ?.map((s) => s.step?.trim())
          .filter(Boolean) ?? [];

      const ingredientsList =
        detail.extendedIngredients
          ?.map((ing) => ing.original || ing.name || "")
          .filter(Boolean) ?? [];

      return {
        nama_menu: detail.title || item.title,
        vibe_check: "Practical, ingredient-led, and reliable.",
        estimasi_waktu: detail.readyInMinutes
          ? `${detail.readyInMinutes} min`
          : "20 min",
        estimasi_budget: "Rp18.000 - Rp45.000",
        bahan_bahan: ingredientsList,
        langkah_masak:
          steps.length > 0
            ? steps
            : ["Prepare the ingredients.", "Cook until done.", "Serve warm."],
        info_gizi: {
          kalori: getNutrientValue(nutrients, "Calories", "350 kcal"),
          protein: getNutrientValue(nutrients, "Protein", "18 g"),
          karbo: getNutrientValue(nutrients, "Carbohydrates", "28 g"),
          lemak: getNutrientValue(nutrients, "Fat", "14 g"),
        },
        tips_bestie:
          "Use this as a base and adjust seasoning to fit what you already have.",
        dalle_prompt: `A realistic plated food photograph of ${detail.title || item.title}, elegant modern presentation, soft natural lighting, neutral ceramic plate, editorial food photography, highly detailed.`,
        source: "external" as const,
      };
    })
  );

  return detailResults.filter(Boolean) as ExternalRecipe[];
}

export function dedupeRecipes<T extends { nama_menu?: string }>(recipes: T[]): T[] {
  const seen = new Set<string>();

  return recipes.filter((recipe) => {
    const key = (recipe.nama_menu ?? "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .trim();

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}