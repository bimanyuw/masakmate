"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Clock3,
  DollarSign,
  Minus,
  Plus,
  Users,
} from "lucide-react";

type Language = "en" | "id";

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
  dalle_prompt?: string;
};

const detailCopy = {
  en: {
    selectedMenu: "Selected Menu",
    description: "Description",
    time: "Time",
    budget: "Budget",
    calories: "Calories",
    protein: "Protein",
    ingredients: "Ingredients",
    servings: "Servings",
    method: "Method",
    nutrition: "Nutrition",
    chefsNote: "Chef’s Note",
    back: "Back",
  },
  id: {
    selectedMenu: "Menu Terpilih",
    description: "Deskripsi",
    time: "Waktu",
    budget: "Budget",
    calories: "Kalori",
    protein: "Protein",
    ingredients: "Bahan",
    servings: "Porsi",
    method: "Cara membuat",
    nutrition: "Informasi gizi",
    chefsNote: "Catatan Chef",
    back: "Kembali",
  },
} as const;

export default function MenuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(2);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const raw = sessionStorage.getItem(id);
    const savedLanguage = localStorage.getItem("makanmate-language");

    if (savedLanguage === "en" || savedLanguage === "id") {
      setLanguage(savedLanguage);
    }

    if (!raw) {
      router.push("/");
      return;
    }

    const parsed: Recipe = JSON.parse(raw);
    setRecipe(parsed);
  }, [id, router]);

  const t = detailCopy[language];

  const detailedDescription = useMemo(() => {
    if (!recipe) return "";
    return buildDetailedDescription(recipe, language);
  }, [recipe, language]);

  const detailedIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.bahan_bahan.map((item, index) =>
      scaleIngredient(item, servings, index, language)
    );
  }, [recipe, servings, language]);

  const detailedMethod = useMemo(() => {
    if (!recipe) return [];
    return recipe.langkah_masak.map((step, index) =>
      expandMethodStep(step, index, recipe, language)
    );
  }, [recipe, language]);

  const rupiahBudget = useMemo(() => {
    if (!recipe) return "";
    return toRupiahBudget(recipe.estimasi_budget, servings);
  }, [recipe, servings]);

  if (!recipe) {
    return (
      <main className="min-h-screen bg-[#efe7d8] px-6 py-20 text-[#1f1c17]">
        <div className="mx-auto max-w-6xl">Loading menu...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#efe7d8] text-[#1f1c17]">
      <section className="mx-auto max-w-6xl px-6 py-10 md:px-8">
        <button
          onClick={() => router.push("/")}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d3c6b4] bg-[#f7f1e8] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.back}
        </button>

        <div className="rounded-[32px] border border-[#d8cebb] bg-[#f7f1e8] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7a7469]">
            {t.selectedMenu}
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            {formatMenuTitle(recipe.nama_menu)}
          </h1>

          <p className="mt-4 max-w-4xl text-base italic leading-7 text-[#635d54] md:text-lg">
            {recipe.vibe_check}
          </p>

          <div className="mt-8 rounded-[24px] border border-[#ddd2c0] bg-white/60 p-6">
            <h2 className="text-2xl font-semibold">{t.description}</h2>
            <p className="mt-4 leading-8 text-[#635d54]">{detailedDescription}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[22px] border border-[#ddd2c0] bg-white/60 p-4">
              <div className="flex items-center gap-2 text-[#7a7469]">
                <Clock3 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  {t.time}
                </span>
              </div>
              <p className="mt-3 text-xl font-semibold">
                {recipe.estimasi_waktu}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#ddd2c0] bg-white/60 p-4">
              <div className="flex items-center gap-2 text-[#7a7469]">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  {t.budget}
                </span>
              </div>
              <p className="mt-3 text-xl font-semibold">{rupiahBudget}</p>
            </div>

            <div className="rounded-[22px] border border-[#ddd2c0] bg-white/60 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7469]">
                {t.calories}
              </span>
              <p className="mt-3 text-xl font-semibold">
                {recipe.info_gizi.kalori}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#ddd2c0] bg-white/60 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7469]">
                {t.protein}
              </span>
              <p className="mt-3 text-xl font-semibold">
                {recipe.info_gizi.protein}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold">{t.ingredients}</h2>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d8cebb] bg-[#f7f1e8] px-4 py-2 text-sm font-semibold text-[#635d54]">
                    <Users className="h-4 w-4" />
                    {t.servings}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d8cebb] bg-[#f7f1e8] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#1f1c17] transition hover:border-[#d8cebb] hover:bg-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="min-w-[28px] text-center text-sm font-semibold">
                      {servings}
                    </span>

                    <button
                      type="button"
                      onClick={() => setServings((prev) => Math.min(10, prev + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#1f1c17] transition hover:border-[#d8cebb] hover:bg-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-[#635d54]">
                {detailedIngredients.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 rounded-[18px] border border-[#eee3d3] bg-[#fffdf9] px-4 py-3"
                  >
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#1f1c17]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-6">
              <h2 className="text-2xl font-semibold">{t.method}</h2>
              <ol className="mt-6 space-y-4 text-[#635d54]">
                {detailedMethod.map((step, index) => (
                  <li
                    key={index}
                    className="rounded-[18px] border border-[#eee3d3] bg-[#fffdf9] px-4 py-4"
                  >
                    <div className="flex gap-3">
                      <span className="shrink-0 font-semibold text-[#1f1c17]">
                        {index + 1}.
                      </span>
                      <span className="leading-7">{step}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-6">
              <h2 className="text-2xl font-semibold">{t.nutrition}</h2>
              <div className="mt-5 grid gap-3 text-[#635d54] sm:grid-cols-2">
                <p className="rounded-[18px] border border-[#eee3d3] bg-[#fffdf9] px-4 py-3">
                  Calories: {recipe.info_gizi.kalori}
                </p>
                <p className="rounded-[18px] border border-[#eee3d3] bg-[#fffdf9] px-4 py-3">
                  Protein: {recipe.info_gizi.protein}
                </p>
                <p className="rounded-[18px] border border-[#eee3d3] bg-[#fffdf9] px-4 py-3">
                  Carbs: {recipe.info_gizi.karbo}
                </p>
                <p className="rounded-[18px] border border-[#eee3d3] bg-[#fffdf9] px-4 py-3">
                  Fat: {recipe.info_gizi.lemak}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-6">
              <h2 className="text-2xl font-semibold">{t.chefsNote}</h2>
              <p className="mt-5 leading-8 text-[#635d54]">
                {expandChefNote(recipe.tips_bestie, recipe, language)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatMenuTitle(title: string) {
  return title
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function buildDetailedDescription(recipe: Recipe, language: Language) {
  const title = formatMenuTitle(recipe.nama_menu);
  const primaryIngredients = recipe.bahan_bahan.slice(0, 4).join(", ");

  if (language === "id") {
    return `${title} dirancang sebagai hidangan rumahan yang seimbang dengan presentasi yang lebih rapi dan terstruktur. Resep ini menonjolkan ${primaryIngredients} sebagai elemen utama, sehingga menghasilkan menu yang tetap praktis untuk keseharian namun terasa lebih polished. Menu ini cocok untuk makan siang atau makan malam, dengan profil rasa yang dibuat agar terasa seimbang, memuaskan, dan mudah dinikmati. Proses memasaknya tetap approachable, tetapi hasil akhirnya diharapkan terasa matang, utuh, dan tidak terburu-buru.`;
  }

  return `${title} is designed as a balanced home-cooked dish with a cleaner, more composed presentation. The recipe highlights ${primaryIngredients} as its core elements, giving the plate a practical everyday character while still feeling structured and polished. It works well for lunch or dinner, with a flavor profile that aims to be rounded, satisfying, and easy to enjoy. The preparation is approachable, yet the final dish is intended to feel thoughtful and complete rather than rushed.`;
}

function scaleIngredient(
  item: string,
  servings: number,
  index: number,
  language: Language
) {
  const lower = item.toLowerCase();
  const tbsp = language === "id" ? "sdm" : "tbsp";
  const cloves = language === "id" ? "siung" : "cloves";
  const pieces = language === "id" ? "buah" : "pieces";

  if (/egg|telur/.test(lower))
    return language === "id" ? `${servings} butir telur` : `${servings} eggs`;
  if (/rice|nasi/.test(lower))
    return language === "id"
      ? `${Math.max(100, servings * 100)} g nasi matang`
      : `${Math.max(100, servings * 100)} g cooked rice`;
  if (/chicken|ayam/.test(lower))
    return language === "id"
      ? `${Math.max(120, servings * 120)} g ayam`
      : `${Math.max(120, servings * 120)} g chicken`;
  if (/garlic|bawang putih/.test(lower))
    return `${Math.max(1, servings)} ${cloves} ${
      language === "id" ? "bawang putih" : "garlic"
    }`;
  if (/shallot|bawang merah/.test(lower))
    return language === "id"
      ? `${Math.max(1, servings)} siung bawang merah`
      : `${Math.max(1, servings)} shallots`;
  if (/chili|cabai/.test(lower))
    return language === "id"
      ? `${Math.max(1, servings)} buah cabai`
      : `${Math.max(1, servings)} chilies`;
  if (/butter|mentega/.test(lower))
    return `${Math.max(1, servings)} ${tbsp} ${
      language === "id" ? "mentega" : "butter"
    }`;
  if (/mushroom|jamur/.test(lower))
    return language === "id"
      ? `${Math.max(50, servings * 50)} g jamur`
      : `${Math.max(50, servings * 50)} g mushrooms`;
  if (/noodles|mie|linguine|spaghetti|pasta/.test(lower))
    return language === "id"
      ? `${Math.max(80, servings * 80)} g mi/pasta`
      : `${Math.max(80, servings * 80)} g noodles`;
  if (/sausage|sosis/.test(lower))
    return language === "id"
      ? `${Math.max(80, servings * 80)} g sosis`
      : `${Math.max(80, servings * 80)} g sausage`;
  if (/tomato|tomatoes|tomat/.test(lower))
    return language === "id"
      ? `${Math.max(1, servings)} buah tomat`
      : `${Math.max(1, servings)} tomatoes`;

  const templates =
    language === "id"
      ? [
          `${Math.max(50, servings * 50)} g ${item}`,
          `${Math.max(1, servings)} ${pieces} ${item}`,
          `${Math.max(1, servings * 2)} ${tbsp} ${item}`,
          `${Math.max(75, servings * 75)} ml ${item}`,
        ]
      : [
          `${Math.max(50, servings * 50)} g ${item}`,
          `${Math.max(1, servings)} pieces ${item}`,
          `${Math.max(1, servings * 2)} ${tbsp} ${item}`,
          `${Math.max(75, servings * 75)} ml ${item}`,
        ];

  return templates[index % templates.length];
}

function expandMethodStep(
  step: string,
  index: number,
  recipe: Recipe,
  language: Language
) {
  const ingredients = recipe.bahan_bahan.slice(0, 3).join(", ");

  if (language === "id") {
    const expansions = [
      `Siapkan dan ukur semua bahan terlebih dahulu agar proses memasak terasa lebih rapi dan efisien. ${step} sambil menjaga panas tetap stabil dan area kerja tetap bersih.`,
      `Pada tahap ini, fokus pada pembangunan rasa secara bertahap. ${step} dan pastikan aromatik serta bahan utama seperti ${ingredients} matang merata tanpa overcooked.`,
      `Lanjutkan proses dengan memperhatikan tekstur dan keseimbangan bumbu. ${step} sambil koreksi rasa seperlunya agar hasil akhir tetap seimbang dan konsisten.`,
      `Selesaikan tahap ini dengan hati-hati, pastikan semua komponen matang sempurna dan menyatu dengan baik. ${step} lalu sesuaikan bumbu akhir sebelum plating.`,
      `Akhiri masakan dengan memeriksa warna, aroma, dan tekstur. ${step} lalu sajikan segera untuk hasil terbaik.`,
    ];

    return (
      expansions[index] ||
      `${step} Lakukan tahap ini dengan hati-hati agar tekstur, panas, dan rasa tetap seimbang.`
    );
  }

  const expansions = [
    `Prepare and measure all ingredients first so the cooking process feels organized and efficient. ${step} while keeping the heat controlled and the workstation tidy.`,
    `At this stage, focus on building flavor gradually. ${step} and make sure the aromatics and key ingredients such as ${ingredients} cook evenly without becoming overdone.`,
    `Continue the process with attention to texture and seasoning. ${step} while tasting as needed so the dish remains balanced and consistent.`,
    `Finish this stage carefully, making sure the components are fully cooked and well combined. ${step} and adjust the final seasoning before plating.`,
    `Complete the dish by checking color, aroma, and texture. ${step} and serve immediately for the best overall result.`,
  ];

  return (
    expansions[index] ||
    `${step} Carry out this step carefully and keep the dish balanced in texture, heat, and seasoning.`
  );
}

function toRupiahBudget(text: string, servings: number) {
  const numericMatches = text.match(/\d+/g);

  if (!numericMatches) {
    const min = 15000 * Math.max(1, Math.round(servings / 2));
    const max = 30000 * Math.max(1, Math.round(servings / 2));
    return `${formatRupiah(min)} - ${formatRupiah(max)}`;
  }

  const values = numericMatches.map(Number);
  const multiplier = Math.max(1, Math.round(servings / 2));

  let min = (values[0] || 15) * 1000 * multiplier;
  let max = (values[1] || values[0] || 30) * 1000 * multiplier;

  if (max <= min) {
    max = min + 10000 * multiplier;
  }

  return `${formatRupiah(min)} - ${formatRupiah(max)}`;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function expandChefNote(note: string, recipe: Recipe, language: Language) {
  if (language === "id") {
    return `${note} Untuk hasil akhir yang lebih baik, perhatikan keseimbangan rasa, suhu memasak, dan kerapihan plating. Hidangan ini paling ideal disajikan segera setelah matang agar tekstur ${recipe.bahan_bahan
      .slice(0, 2)
      .join(" dan ")} tetap optimal.`;
  }

  return `${note} For a better final result, pay attention to seasoning balance, cooking temperature, and plating cleanliness. This dish works best when served immediately after cooking, so the texture of ${recipe.bahan_bahan
    .slice(0, 2)
    .join(" and ")} stays at its best.`;
}
