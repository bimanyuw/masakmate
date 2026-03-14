"use client";

import { useState } from "react";
import FeatureSelector from "@/components/FeatureSelector";
import IngredientForm from "@/components/IngredientForm";

type Recipe = {
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
};

type RecipeResponse = {
  rekomendasi_menu: Recipe[];
};

export default function Home() {
  const [selectedFeature, setSelectedFeature] = useState("ingredients");
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerateRecipe() {
    if (!ingredients.trim()) {
      alert("Isi dulu bahan yang kamu punya ya");
      return;
    }

    try {
      setLoading(true);
      setRecipe(null);

      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Gagal generate recipe");
      }

      setRecipe(data);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal ambil ide masak. Cek API dulu ya."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EBDD] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#3E5F4D] mb-4">
            MasakMate
          </h1>
          <p className="text-lg text-[#5C6B63] max-w-2xl mx-auto">
            AI cooking buddy buat bantu kamu cari ide masak yang sat-set, hemat,
            dan anti-ribet.
          </p>
        </div>

        <FeatureSelector
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
        />

        {selectedFeature === "ingredients" && (
          <div className="space-y-6">
            <IngredientForm
              ingredients={ingredients}
              setIngredients={setIngredients}
            />

            <div className="text-center">
              <button
                type="button"
                onClick={handleGenerateRecipe}
                disabled={loading}
                className="cursor-pointer bg-[#6F8F7B] hover:bg-[#3E5F4D] disabled:bg-[#AFC8B4] text-white font-semibold px-6 py-3 rounded-2xl transition shadow-sm"
              >
                {loading ? "Lagi masakin ide..." : "Cari Ide Masak"}
              </button>
            </div>
          </div>
        )}

        {recipe && (
          <div className="mt-10 space-y-6 max-w-3xl mx-auto">
            {recipe.rekomendasi_menu.map((item, index) => (
              <div
                key={index}
                className="bg-[#FFFaf3] rounded-2xl shadow-md p-6 border border-[#D8C7A6]"
              >
                <div className="mb-3">
                  <p className="text-sm text-[#6F8F7B] font-semibold">
                    Menu {index + 1}
                  </p>
                  <h2 className="text-2xl font-bold text-[#3E5F4D]">
                    {item.nama_menu}
                  </h2>
                </div>

                <p className="text-[#5C6B63] mb-4">{item.vibe_check}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#F4EBDD] rounded-xl p-4 border border-[#AFC8B4]">
                    <p className="font-semibold text-[#3E5F4D]">
                      Estimasi Waktu
                    </p>
                    <p className="text-[#5C6B63]">{item.estimasi_waktu}</p>
                  </div>

                  <div className="bg-[#F4EBDD] rounded-xl p-4 border border-[#AFC8B4]">
                    <p className="font-semibold text-[#3E5F4D]">
                      Estimasi Budget
                    </p>
                    <p className="text-[#5C6B63]">{item.estimasi_budget}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-[#3E5F4D]">
                    Bahan-bahan
                  </h3>
                  <ul className="list-disc pl-5 text-[#5C6B63] space-y-1">
                    {item.bahan_bahan.map((bahan, i) => (
                      <li key={i}>{bahan}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-[#3E5F4D]">
                    Langkah Masak
                  </h3>
                  <ol className="list-decimal pl-5 text-[#5C6B63] space-y-1">
                    {item.langkah_masak.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-[#3E5F4D]">
                    Info Gizi
                  </h3>
                  <p className="text-[#5C6B63]">
                    Kalori: {item.info_gizi.kalori} | Protein:{" "}
                    {item.info_gizi.protein} | Karbo: {item.info_gizi.karbo} |
                    Lemak: {item.info_gizi.lemak}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-[#3E5F4D]">
                    Tips Bestie
                  </h3>
                  <p className="text-[#5C6B63]">{item.tips_bestie}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}