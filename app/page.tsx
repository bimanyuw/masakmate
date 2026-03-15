"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ChefHat,
  Clock3,
  Crown,
  Flame,
  Sparkles,
  Star,
  UtensilsCrossed,
  Wand2,
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

type RecipeResponse = {
  rekomendasi_menu: Recipe[];
};

const previewGeneratedRecipe: RecipeResponse = {
  rekomendasi_menu: [
    {
      nama_menu: "Garlic Butter Chicken Rice",
      vibe_check: "Clean, savory, and comforting.",
      estimasi_waktu: "20 min",
      estimasi_budget: "Rp18.000 - Rp35.000",
      bahan_bahan: ["chicken", "rice", "garlic", "butter"],
      langkah_masak: [
        "Season the chicken lightly.",
        "Sear with butter and garlic until golden.",
        "Serve over warm rice.",
      ],
      info_gizi: {
        kalori: "420 kcal",
        protein: "24 g",
        karbo: "34 g",
        lemak: "18 g",
      },
      tips_bestie: "Finish with a final taste adjustment before serving.",
    },
    {
      nama_menu: "Tomato Egg Skillet",
      vibe_check: "Light, warm, and balanced.",
      estimasi_waktu: "15 min",
      estimasi_budget: "Rp12.000 - Rp22.000",
      bahan_bahan: ["eggs", "tomatoes", "garlic"],
      langkah_masak: [
        "Saute the garlic until fragrant.",
        "Cook the tomatoes until soft.",
        "Add the eggs and stir gently until just set.",
      ],
      info_gizi: {
        kalori: "280 kcal",
        protein: "16 g",
        karbo: "10 g",
        lemak: "18 g",
      },
      tips_bestie: "Keep the eggs soft for a smoother finish.",
    },
    {
      nama_menu: "Soy Glazed Mushroom Noodles",
      vibe_check: "Savory, glossy, and weeknight-friendly.",
      estimasi_waktu: "18 min",
      estimasi_budget: "Rp15.000 - Rp28.000",
      bahan_bahan: ["noodles", "mushrooms", "soy sauce", "garlic"],
      langkah_masak: [
        "Cook the noodles until tender.",
        "Saute garlic and mushrooms in a pan.",
        "Add soy sauce and toss with the noodles.",
      ],
      info_gizi: {
        kalori: "390 kcal",
        protein: "12 g",
        karbo: "52 g",
        lemak: "14 g",
      },
      tips_bestie: "Add the sauce gradually so the noodles stay balanced.",
    },
    {
      nama_menu: "Shallot Omelette Toast",
      vibe_check: "Soft, warm, and simple.",
      estimasi_waktu: "12 min",
      estimasi_budget: "Rp10.000 - Rp18.000",
      bahan_bahan: ["eggs", "shallots", "bread", "butter"],
      langkah_masak: [
        "Toast the bread until crisp.",
        "Cook the omelette gently with sliced shallots.",
        "Serve over warm buttered toast.",
      ],
      info_gizi: {
        kalori: "310 kcal",
        protein: "14 g",
        karbo: "20 g",
        lemak: "18 g",
      },
      tips_bestie: "Cook on low heat for a softer texture.",
    },
    {
      nama_menu: "Pan-Seared Soy Chicken",
      vibe_check: "Glossy, practical, and satisfying.",
      estimasi_waktu: "22 min",
      estimasi_budget: "Rp20.000 - Rp36.000",
      bahan_bahan: ["chicken", "soy sauce", "garlic", "pepper"],
      langkah_masak: [
        "Season the chicken lightly.",
        "Sear in a hot pan until lightly browned.",
        "Add garlic and soy sauce, then reduce briefly.",
      ],
      info_gizi: {
        kalori: "430 kcal",
        protein: "30 g",
        karbo: "8 g",
        lemak: "24 g",
      },
      tips_bestie: "Rest the chicken briefly before serving.",
    },
    {
      nama_menu: "Butter Garlic Mushrooms",
      vibe_check: "Rich, earthy, and polished.",
      estimasi_waktu: "14 min",
      estimasi_budget: "Rp14.000 - Rp24.000",
      bahan_bahan: ["mushrooms", "garlic", "butter", "pepper"],
      langkah_masak: [
        "Melt butter in a pan.",
        "Cook the mushrooms until golden.",
        "Add garlic and finish with pepper.",
      ],
      info_gizi: {
        kalori: "240 kcal",
        protein: "7 g",
        karbo: "12 g",
        lemak: "17 g",
      },
      tips_bestie: "Avoid overcrowding the pan so the mushrooms brown well.",
    },
    {
      nama_menu: "Chicken Tomato Rice Bowl",
      vibe_check: "Bright, hearty, and clean.",
      estimasi_waktu: "20 min",
      estimasi_budget: "Rp18.000 - Rp32.000",
      bahan_bahan: ["chicken", "rice", "tomatoes", "garlic"],
      langkah_masak: [
        "Cook the chicken until lightly golden.",
        "Prepare the tomatoes with garlic until softened.",
        "Serve both over warm rice.",
      ],
      info_gizi: {
        kalori: "450 kcal",
        protein: "26 g",
        karbo: "38 g",
        lemak: "18 g",
      },
      tips_bestie: "A little acidity from the tomato keeps it balanced.",
    },
    {
      nama_menu: "Savory Egg Fried Noodles",
      vibe_check: "Quick, familiar, and deeply comforting.",
      estimasi_waktu: "16 min",
      estimasi_budget: "Rp12.000 - Rp22.000",
      bahan_bahan: ["eggs", "noodles", "garlic", "soy sauce"],
      langkah_masak: [
        "Cook the noodles and drain well.",
        "Scramble the eggs lightly in a pan.",
        "Add garlic, soy sauce, and noodles, then toss together.",
      ],
      info_gizi: {
        kalori: "410 kcal",
        protein: "15 g",
        karbo: "54 g",
        lemak: "15 g",
      },
      tips_bestie: "Keep the noodles dry enough so they do not turn soggy.",
    },
    {
      nama_menu: "Mushroom Tomato Saute",
      vibe_check: "Fresh, soft, and quietly elegant.",
      estimasi_waktu: "13 min",
      estimasi_budget: "Rp12.000 - Rp20.000",
      bahan_bahan: ["mushrooms", "tomatoes", "garlic", "butter"],
      langkah_masak: [
        "Saute garlic in butter.",
        "Cook mushrooms until lightly colored.",
        "Add tomatoes and cook briefly until softened.",
      ],
      info_gizi: {
        kalori: "230 kcal",
        protein: "6 g",
        karbo: "14 g",
        lemak: "16 g",
      },
      tips_bestie: "Do not overcook the tomatoes if you want a fresher finish.",
    },
    {
      nama_menu: "Golden Chicken Butter Toast",
      vibe_check: "Crisp, warm, and indulgent.",
      estimasi_waktu: "18 min",
      estimasi_budget: "Rp16.000 - Rp28.000",
      bahan_bahan: ["chicken", "bread", "butter", "garlic"],
      langkah_masak: [
        "Cook the chicken until fully done and lightly golden.",
        "Toast the bread with butter.",
        "Serve sliced chicken over the toast with garlic butter.",
      ],
      info_gizi: {
        kalori: "440 kcal",
        protein: "27 g",
        karbo: "26 g",
        lemak: "22 g",
      },
      tips_bestie: "Toast the bread last so it stays crisp.",
    },
  ],
};

const copy = {
  en: {
    navBadge1: "AI Cooking",
    navBadge2: "Modern Menu",
    heroTag: "Elegant AI Culinary Experience",
    heroTitle1: "Cook from",
    heroTitle2: "what you have,",
    heroTitle3: "plate it with elegance.",
    heroDesc:
      "Turn everyday ingredients into composed menu ideas with a more modern, polished, and restaurant-inspired presentation. Simple pantry items can still feel thoughtfully curated.",
    discover: "Discover menus",
    begin: "Begin experience",
    stats1: "delicious menu inspirations",
    stats2: "menus generated per request",
    stats3: "instant ingredient-based results",
    stats4: "clean modern dining-inspired interface",
    generatorTag: "Recipe generator",
    generatorTitle1: "Enter your ingredients,",
    generatorTitle2: "let the AI compose the menu.",
    generatorDesc:
      "This is the core of the experience. Add the ingredients you already have, and the system will generate menu ideas that feel cleaner, smarter, and more refined.",
    highlight1: "Refined suggestions",
    highlight1Desc:
      "Ingredient-based dishes presented with a more polished and elevated tone.",
    highlight2: "Quick generation",
    highlight2Desc:
      "Enter what you have and get a curated set of menu ideas in seconds.",
    highlight3: "Easy to cook",
    highlight3Desc:
      "Clear steps and realistic preparation flow for everyday cooking.",
    highlight4: "Flexible results",
    highlight4Desc:
      "Adaptable to your budget, tools, pantry, and preferred cooking style.",
    startHere: "Start here",
    createMenu: "Create your next menu",
    inputDesc:
      "Enter the ingredients you have on hand, such as eggs, mushrooms, garlic, butter, or chicken.",
    availableIngredients: "Available ingredients",
    placeholder: "Example: eggs, sausage, napa cabbage, garlic",
    detectedIngredients: "Detected ingredients",
    generate: "Generate 10 menus",
    regenerate: "Regenerate",
    generating: "Composing your menus...",
    recommendedTag: "Recommended menus",
    recommendedTitle: "Crafted from your ingredients",
    recommendedDesc:
      "Your generated menus appear here right after the recipe generator so the flow feels immediate and easier to explore.",
    viewDetails: "View details",
    time: "Time",
    budget: "Budget",
    ingredients: "Ingredients",
    method: "Method",
    nutrition: "Nutrition",
    chefsNote: "Chef's note",
    mayarTag: "Premium membership",
    mayarTitle: "Join premium for unlimited recipe access",
    mayarDesc:
      "Unlock unlimited recipe generation, curated signature dishes, and a more exclusive cooking experience inspired by certified Michelin and renowned chef-style menus.",
    mayarChip1: "Unlimited recipes",
    mayarChip2: "Michelin-inspired menus",
    mayarChip3: "Famous chef-style collections",
    mayarButton: "Join premium with Mayar",
    inspirationsTag: "Curated inspirations",
    inspirationsTitle: "Over 1000+ delicious menu ideas",
    inspirationsDesc:
      "A visual section that uses food-only imagery to strengthen the culinary feel of the product without distracting from the generator itself.",
    whyTag: "Why this works",
    whyTitle: "More than just a recipe tool",
    whyDesc:
      "Additional supporting points help the landing page feel complete. It frames the product as a polished cooking experience, not just a simple generator.",
    point1: "A refined cooking experience built from simple ingredients",
    point2: "Cleaner menu naming with a more elegant restaurant-style tone",
    point3: "Ideal for solo cooking, family meals, and everyday meal prep",
    point4: "Tap any menu to explore full details with scalable servings",
    footerDesc:
      "AI-powered recipe inspiration built for practical cooking, cleaner menu discovery, and a more polished kitchen experience.",
    poweredBy: "Powered by Mayar",
    email: "Email",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    menu: "Menu",
  },
  id: {
    navBadge1: "AI Memasak",
    navBadge2: "Menu Modern",
    heroTag: "Pengalaman Kuliner AI Elegan",
    heroTitle1: "Masak dari",
    heroTitle2: "bahan yang kamu punya,",
    heroTitle3: "sajikan dengan elegan.",
    heroDesc:
      "Ubah bahan sehari-hari menjadi ide menu yang lebih modern, rapi, dan terasa premium. Bahan dapur sederhana pun tetap bisa terasa istimewa.",
    discover: "Lihat menu",
    begin: "Mulai sekarang",
    stats1: "inspirasi menu lezat",
    stats2: "menu per generate",
    stats3: "hasil instan berbasis bahan",
    stats4: "tampilan modern bernuansa dining",
    generatorTag: "Generator resep",
    generatorTitle1: "Masukkan bahanmu,",
    generatorTitle2: "biarkan AI menyusun menunya.",
    generatorDesc:
      "Ini adalah inti dari pengalaman web ini. Masukkan bahan yang kamu punya, lalu sistem akan menghasilkan ide menu yang terasa lebih rapi, cerdas, dan refined.",
    highlight1: "Rekomendasi lebih refined",
    highlight1Desc:
      "Menu berbasis bahan yang ditampilkan dengan tone yang lebih rapi dan elegan.",
    highlight2: "Generate cepat",
    highlight2Desc:
      "Masukkan bahan yang tersedia dan dapatkan ide menu dalam hitungan detik.",
    highlight3: "Mudah dimasak",
    highlight3Desc:
      "Langkah-langkah jelas dan realistis untuk memasak sehari-hari.",
    highlight4: "Hasil fleksibel",
    highlight4Desc:
      "Bisa menyesuaikan budget, alat masak, stok dapur, dan preferensi pengguna.",
    startHere: "Mulai di sini",
    createMenu: "Buat menu berikutnya",
    inputDesc:
      "Masukkan bahan yang tersedia, seperti telur, jamur, bawang putih, mentega, atau ayam.",
    availableIngredients: "Bahan yang tersedia",
    placeholder: "Contoh: telur, sosis, sawi putih, bawang putih",
    detectedIngredients: "Bahan terdeteksi",
    generate: "Buat 10 menu",
    regenerate: "Buat ulang",
    generating: "Sedang menyusun menu...",
    recommendedTag: "Rekomendasi menu",
    recommendedTitle: "Menu dari bahanmu",
    recommendedDesc:
      "Hasil menu muncul langsung setelah generator agar alurnya terasa cepat dan mudah dijelajahi.",
    viewDetails: "Lihat detail",
    time: "Waktu",
    budget: "Budget",
    ingredients: "Bahan",
    method: "Cara membuat",
    nutrition: "Informasi gizi",
    chefsNote: "Catatan chef",
    mayarTag: "Membership premium",
    mayarTitle: "Gabung premium untuk akses resep tanpa batas",
    mayarDesc:
      "Dapatkan akses resep tanpa batas, menu signature eksklusif, dan pengalaman memasak yang lebih premium dengan inspirasi dari menu bergaya Michelin dan chef ternama.",
    mayarChip1: "Resep tanpa batas",
    mayarChip2: "Menu bergaya Michelin",
    mayarChip3: "Koleksi ala chef terkenal",
    mayarButton: "Gabung premium dengan Mayar",
    inspirationsTag: "Inspirasi terkurasi",
    inspirationsTitle: "1000+ inspirasi menu lezat",
    inspirationsDesc:
      "Bagian visual ini memakai gambar makanan saja agar nuansa kulinernya kuat tanpa mengganggu fokus utama pada generator resep.",
    whyTag: "Kenapa ini menarik",
    whyTitle: "Lebih dari sekadar alat resep",
    whyDesc:
      "Bagian pendukung ini membuat landing page terasa lebih utuh. Produk diposisikan sebagai pengalaman memasak yang lebih polished, bukan sekadar generator biasa.",
    point1: "Pengalaman memasak yang lebih refined dari bahan sederhana",
    point2: "Penamaan menu lebih bersih dan elegan",
    point3: "Cocok untuk masak sendiri, keluarga, dan meal prep harian",
    point4: "Klik menu untuk melihat detail lengkap dan porsi yang bisa disesuaikan",
    footerDesc:
      "Inspirasi resep berbasis AI untuk memasak yang lebih praktis, eksplorasi menu yang lebih rapi, dan pengalaman dapur yang lebih elegan.",
    poweredBy: "Didukung oleh Mayar",
    email: "Email",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    menu: "Menu",
  },
} as const;

const galleryImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
];

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreviewGenerated = searchParams.get("preview") === "generated";

  const [language, setLanguage] = useState<Language>("en");
  const [ingredients, setIngredients] = useState(
    isPreviewGenerated
      ? "chicken, eggs, rice, noodles, garlic, shallots, mushrooms, tomatoes, butter, soy sauce"
      : ""
  );
  const [recipe, setRecipe] = useState<RecipeResponse | null>(
    isPreviewGenerated ? previewGeneratedRecipe : null
  );
  const [loading, setLoading] = useState(false);
  const [requestSeed, setRequestSeed] = useState(0);
  const resultsRef = useRef<HTMLElement | null>(null);

  const t = copy[language];

  useEffect(() => {
    const savedLanguage = localStorage.getItem("makanmate-language");
    const savedIngredients = sessionStorage.getItem("makanmate-ingredients");
    const savedRecipes = sessionStorage.getItem("makanmate-recipes");

    if (savedLanguage === "en" || savedLanguage === "id") {
      setLanguage(savedLanguage);
    }

    if (isPreviewGenerated) {
      return;
    }

    if (savedIngredients) setIngredients(savedIngredients);

    if (savedRecipes) {
      try {
        setRecipe(JSON.parse(savedRecipes));
      } catch {
        sessionStorage.removeItem("makanmate-recipes");
      }
    }
  }, [isPreviewGenerated]);

  const ingredientPreview = useMemo(
    () =>
      ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6),
    [ingredients]
  );

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage);
    localStorage.setItem("makanmate-language", nextLanguage);
  }

  async function handleGenerateRecipe(forceRefresh = false) {
    if (!ingredients.trim()) {
      alert(
        language === "id"
          ? "Masukkan dulu bahan yang kamu punya."
          : "Please enter the ingredients you have first."
      );
      return;
    }

    try {
      setLoading(true);
      if (!forceRefresh) setRecipe(null);

      const nextSeed = forceRefresh ? Date.now() : requestSeed || Date.now();
      if (forceRefresh) setRequestSeed(nextSeed);

      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          count: 10,
          regenerate: forceRefresh,
          seed: nextSeed,
          namingStyle: "classy-minimal-fine-dining",
          language: language === "id" ? "indonesian" : "english",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to generate recipes.");
      }

      const normalizedRecipe = {
        ...data,
        rekomendasi_menu: Array.isArray(data.rekomendasi_menu)
          ? data.rekomendasi_menu.slice(0, 10)
          : [],
      };

      setRecipe(normalizedRecipe);
      sessionStorage.setItem("makanmate-ingredients", ingredients);
      sessionStorage.setItem("makanmate-recipes", JSON.stringify(normalizedRecipe));

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : language === "id"
          ? "Gagal membuat ide resep."
          : "Failed to generate recipe ideas."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenMenu(item: Recipe, index: number) {
    const key = `menu-${index}`;
    sessionStorage.setItem(key, JSON.stringify(item));
    if (recipe) sessionStorage.setItem("makanmate-recipes", JSON.stringify(recipe));
    sessionStorage.setItem("makanmate-ingredients", ingredients);
    router.push(`/menu/${key}`);
  }

  function scrollToGenerator() {
    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#efe7d8] text-[#1f1c17] selection:bg-[#1f1c17] selection:text-white">
      <section className="relative min-h-screen overflow-hidden bg-[#111] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-[#111]/80" />

        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-light italic tracking-tight text-white/95"
          >
            MasakMate
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden items-center gap-3 md:flex"
            >
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                {t.navBadge1}
              </span>
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                {t.navBadge2}
              </span>
            </motion.div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                  language === "en"
                    ? "bg-white text-[#1f1c17]"
                    : "border border-white/25 bg-white/10 text-white/80"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("id")}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                  language === "id"
                    ? "bg-white text-[#1f1c17]"
                    : "border border-white/25 bg-white/10 text-white/80"
                }`}
              >
                ID
              </button>
            </div>
          </div>
        </header>

        <div className="relative z-20 mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl items-center px-6 pb-16 pt-8 md:px-8">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 text-sm font-semibold uppercase tracking-[0.35em] text-white/75"
            >
              {t.heroTag}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="max-w-4xl text-5xl font-semibold leading-[0.9] tracking-tight md:text-7xl xl:text-[7rem]"
            >
              {t.heroTitle1}
              <br />
              {t.heroTitle2}
              <br />
              {t.heroTitle3}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-8 max-w-2xl text-base leading-8 text-white/80 md:text-lg"
            >
              {t.heroDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <button
                onClick={scrollToGenerator}
                className="rounded-full bg-white px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#1b1814] transition hover:scale-[1.01]"
              >
                {t.discover}
              </button>
              <button
                onClick={scrollToGenerator}
                className="rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white backdrop-blur transition hover:bg-white/15"
              >
                {t.begin}
              </button>
            </motion.div>
          </div>
        </div>

        <motion.button
          onClick={scrollToGenerator}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 p-4 text-white backdrop-blur transition hover:bg-white/15"
          aria-label="Scroll to generator"
        >
          <ArrowDown className="h-5 w-5" />
        </motion.button>
      </section>

      <section className="border-y border-[#d9cfbd] bg-[#efe7d8]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 md:grid-cols-4 md:px-8">
          {[
            { value: "1000+", label: t.stats1 },
            { value: "10", label: t.stats2 },
            { value: "Fast", label: t.stats3 },
            { value: "Elegant", label: t.stats4 },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="rounded-[28px] border border-[#d8cebb] bg-[#f7f1e8] px-5 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="text-3xl font-semibold tracking-tight md:text-4xl">
                {item.value}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#5f584f]">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="generator" className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-[0.32em] text-[#7a7469]"
            >
              {t.generatorTag}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl"
            >
              {t.generatorTitle1}
              <br />
              {t.generatorTitle2}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-[#635d54]"
            >
              {t.generatorDesc}
            </motion.p>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                {
                  icon: Sparkles,
                  title: t.highlight1,
                  desc: t.highlight1Desc,
                },
                {
                  icon: Clock3,
                  title: t.highlight2,
                  desc: t.highlight2Desc,
                },
                {
                  icon: ChefHat,
                  title: t.highlight3,
                  desc: t.highlight3Desc,
                },
                {
                  icon: Flame,
                  title: t.highlight4,
                  desc: t.highlight4Desc,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="group rounded-[28px] border border-[#d8cebb] bg-[#f7f1e8] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition duration-300 hover:shadow-[0_18px_40px_rgba(0,0,0,0.07)]"
                  >
                    <motion.div
                      whileHover={{ rotate: -8, scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1c17] text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 leading-7 text-[#635d54]">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="lg:sticky lg:top-8 lg:self-start"
          >
            <div className="overflow-hidden rounded-[34px] border border-[#d8cebb] bg-[#f7f1e8] shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              <div className="border-b border-[#e1d8c8] px-6 py-5 md:px-8">
                <div className="flex items-center gap-2 text-sm text-[#7a7469]">
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                  >
                    <Wand2 className="h-4 w-4" />
                  </motion.div>
                  <span className="uppercase tracking-[0.24em]">{t.startHere}</span>
                </div>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  {t.createMenu}
                </h3>
                <p className="mt-3 max-w-lg leading-7 text-[#635d54]">{t.inputDesc}</p>
              </div>

              <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
                <IngredientForm
                  ingredients={ingredients}
                  setIngredients={setIngredients}
                  language={language}
                />

                {ingredientPreview.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#7a7469]">
                      {t.detectedIngredients}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ingredientPreview.map((item, index) => (
                        <motion.span
                          key={item}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.04 }}
                          className="rounded-full border border-[#d5c8b6] bg-[#efe7d8] px-4 py-2 text-sm text-[#3a342d]"
                        >
                          {item}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleGenerateRecipe(false)}
                    disabled={loading}
                    className="w-full rounded-full bg-[#1f1c17] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#111] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? t.generating : t.generate}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateRecipe(true)}
                    disabled={loading || !ingredients.trim()}
                    className="rounded-full border border-[#d2c4b1] bg-[#efe7d8] px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1c17] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t.regenerate}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {recipe && (
        <section
          ref={resultsRef}
          className="border-t border-[#d9cfbd] bg-[#f5eee3] px-6 py-20 md:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7a7469]">
                  {t.recommendedTag}
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
                  {t.recommendedTitle}
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#635d54]">
                  {t.recommendedDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGenerateRecipe(true)}
                disabled={loading}
                className="rounded-full border border-[#cfc2af] bg-[#f7f1e8] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#1f1c17] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t.generating : t.regenerate}
              </button>
            </div>

            <div className="grid gap-6">
              {recipe.rekomendasi_menu.map((item, index) => (
                <motion.article
                  key={`${item.nama_menu}-${index}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: index * 0.03 }}
                  onClick={() => handleOpenMenu(item, index)}
                  className="grid cursor-pointer gap-8 rounded-[34px] border border-[#d8cebb] bg-[#f7f1e8] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)] lg:grid-cols-[0.85fr_1.15fr] lg:p-8"
                >
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full bg-[#1f1c17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                          {t.menu} {index + 1}
                        </span>
                        <span className="inline-flex rounded-full border border-[#d2c4b1] bg-[#efe7d8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f1c17]">
                          {t.viewDetails}
                        </span>
                      </div>

                      <h3 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
                        {formatMenuTitle(item.nama_menu)}
                      </h3>
                      <p className="mt-5 text-lg italic leading-8 text-[#635d54]">
                        {item.vibe_check}
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="rounded-[24px] border border-[#d8cebb] bg-[#efe7d8] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7469]">
                          {t.time}
                        </p>
                        <p className="mt-3 text-2xl font-semibold">{item.estimasi_waktu}</p>
                      </div>
                      <div className="rounded-[24px] border border-[#d8cebb] bg-[#efe7d8] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7469]">
                          {t.budget}
                        </p>
                        <p className="mt-3 text-2xl font-semibold">
                          {formatBudgetToRupiah(item.estimasi_budget)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-5">
                      <h4 className="text-lg font-semibold">{t.ingredients}</h4>
                      <ul className="mt-4 space-y-3 text-[#635d54]">
                        {getDetailedIngredientPreview(item.bahan_bahan, language).map(
                          (bahan, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#1f1c17]" />
                              <span>{bahan}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-5">
                      <h4 className="text-lg font-semibold">{t.method}</h4>
                      <ol className="mt-4 space-y-3 text-[#635d54]">
                        {item.langkah_masak.slice(0, 3).map((step, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="font-semibold text-[#1f1c17]">
                              {i + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-5">
                      <h4 className="text-lg font-semibold">{t.nutrition}</h4>
                      <div className="mt-4 space-y-2 text-[#635d54]">
                        <p>Calories: {item.info_gizi.kalori}</p>
                        <p>Protein: {item.info_gizi.protein}</p>
                        <p>Carbs: {item.info_gizi.karbo}</p>
                        <p>Fat: {item.info_gizi.lemak}</p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-5">
                      <h4 className="text-lg font-semibold">{t.chefsNote}</h4>
                      <p className="mt-4 italic leading-8 text-[#635d54]">
                        {item.tips_bestie}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-[#d9cfbd] bg-[#f5eee3] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7a7469]"
            >
              {t.inspirationsTag}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl"
            >
              {t.inspirationsTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-lg leading-8 text-[#635d54]"
            >
              {t.inspirationsDesc}
            </motion.p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image}
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
                className={`overflow-hidden rounded-[28px] border border-[#ded3c1] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.06)] ${
                  index % 5 === 0 ? "md:translate-y-8" : ""
                } ${index % 3 === 0 ? "md:-rotate-2" : "md:rotate-1"}`}
              >
                <img
                  src={image}
                  alt={`Food inspiration ${index + 1}`}
                  className="h-[220px] w-full object-cover transition duration-500 hover:scale-105 md:h-[300px]"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5eee3] px-6 pb-20 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#d8cebb] bg-[#f7f1e8] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7a7469]">
            {t.mayarTag}
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            {t.mayarTitle}
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-[#635d54]">{t.mayarDesc}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-[#d3c6b4] bg-[#efe7d8] px-4 py-2 text-sm font-semibold text-[#5f584f]">
              {t.mayarChip1}
            </span>
            <span className="rounded-full border border-[#d3c6b4] bg-[#efe7d8] px-4 py-2 text-sm font-semibold text-[#5f584f]">
              {t.mayarChip2}
            </span>
            <span className="rounded-full border border-[#d3c6b4] bg-[#efe7d8] px-4 py-2 text-sm font-semibold text-[#5f584f]">
              {t.mayarChip3}
            </span>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="rounded-full bg-[#1f1c17] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black"
            >
              {t.mayarButton}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#efe7d8] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[36px] border border-[#d8cebb] bg-[#f7f1e8] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <div className="inline-flex rounded-full border border-[#d7cab9] bg-[#efe7d8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#746d62]">
                {t.whyTag}
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
                {t.whyTitle}
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#635d54]">{t.whyDesc}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { icon: UtensilsCrossed, text: t.point1 },
                { icon: Crown, text: t.point2 },
                { icon: ChefHat, text: t.point3 },
                { icon: Star, text: t.point4 },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="rounded-[28px] border border-[#ddd2c0] bg-white/50 p-6"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: -10, scale: 1.08 }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f1c17] text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      <h3 className="text-lg font-semibold">
                        {language === "id" ? `Fitur ${index + 1}` : `Feature ${index + 1}`}
                      </h3>
                    </div>
                    <p className="mt-4 leading-7 text-[#635d54]">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d9cfbd] bg-[#efe7d8] px-6 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight">MasakMate</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[#635d54]">
              {t.footerDesc}
            </p>
          </div>

          <div className="grid gap-1 text-sm text-[#635d54]">
            <p>{t.email}: hello@makanmate.app</p>
            <p>{t.whatsapp}: +62 812-3456-7890</p>
            <p>{t.instagram}: @makanmate.app</p>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-[#d3c6b4] bg-[#f7f1e8] px-4 py-2 text-sm font-semibold text-[#5f584f]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1f1c17] text-white">
              M
            </span>
            {t.poweredBy}
          </div>
        </div>
      </footer>
    </main>
  );
}

function formatMenuTitle(title: string) {
  const normalized = title
    .replace(/bestie/gi, "")
    .replace(/super/gi, "")
    .replace(/ultimate/gi, "")
    .replace(/crazy/gi, "")
    .replace(/wow/gi, "")
    .replace(/yummy/gi, "")
    .replace(/delicious/gi, "")
    .replace(/magic/gi, "")
    .replace(/party/gi, "")
    .replace(/loaded/gi, "")
    .replace(/menu/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "Seasonal Composition";

  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatBudgetToRupiah(text: string) {
  const numericMatches = text.match(/\d+/g);

  if (!numericMatches) return "Rp15.000 - Rp30.000";

  const values = numericMatches.map(Number);
  let min = (values[0] || 15) * 1000;
  let max = (values[1] || values[0] || 30) * 1000;

  if (max <= min) {
    max = min + 10000;
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

function getUnitLabel(
  unit: "tbsp" | "tsp" | "cloves" | "pieces" | "g" | "ml",
  language: Language
) {
  if (language === "en") {
    return {
      tbsp: "tbsp",
      tsp: "tsp",
      cloves: "cloves",
      pieces: "pieces",
      g: "g",
      ml: "ml",
    }[unit];
  }

  return {
    tbsp: "sdm",
    tsp: "sdt",
    cloves: "siung",
    pieces: "buah",
    g: "g",
    ml: "ml",
  }[unit];
}

function getDetailedIngredientPreview(items: string[], language: Language) {
  return items.slice(0, 4).map((item, index) => {
    const tbsp = getUnitLabel("tbsp", language);
    const cloves = getUnitLabel("cloves", language);
    const pieces = getUnitLabel("pieces", language);

    if (/egg|telur/i.test(item)) return language === "id" ? "2 butir telur" : "2 eggs";
    if (/chicken|ayam/i.test(item)) return `150 g ${language === "id" ? "ayam" : "chicken"}`;
    if (/rice|nasi/i.test(item))
      return language === "id" ? "200 g nasi matang" : "200 g cooked rice";
    if (/garlic|bawang putih/i.test(item))
      return `2 ${cloves} ${language === "id" ? "bawang putih" : "garlic"}`;
    if (/shallot|bawang merah/i.test(item))
      return language === "id" ? "2 siung bawang merah" : "2 shallots";
    if (/chili|cabai/i.test(item))
      return language === "id" ? "2 buah cabai" : "2 chilies";
    if (/mushroom|jamur/i.test(item))
      return language === "id" ? "100 g jamur" : "100 g mushrooms";
    if (/butter|mentega/i.test(item))
      return `1 ${tbsp} ${language === "id" ? "mentega" : "butter"}`;
    if (/noodles|mie|linguine|spaghetti|pasta/i.test(item))
      return language === "id" ? "120 g mi/pasta" : "120 g noodles";
    if (/sausage|sosis/i.test(item))
      return language === "id" ? "100 g sosis" : "100 g sausage";
    if (/tomato|tomatoes|tomat/i.test(item))
      return language === "id" ? "2 buah tomat" : "2 tomatoes";

    const defaults =
      language === "id"
        ? [`100 g ${item}`, `2 ${tbsp} ${item}`, `1 ${pieces} ${item}`, `75 g ${item}`]
        : [`100 g ${item}`, `2 ${tbsp} ${item}`, `1 portion ${item}`, `75 g ${item}`];

    return defaults[index % defaults.length];
  });
}

type IngredientFormProps = {
  ingredients: string;
  setIngredients: (value: string) => void;
  language: Language;
};

function IngredientForm({
  ingredients,
  setIngredients,
  language,
}: IngredientFormProps) {
  const t = copy[language];

  return (
    <div>
      <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-[#7a7469]">
        {t.availableIngredients}
      </label>
      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder={t.placeholder}
        className="min-h-[160px] w-full rounded-[28px] border border-[#d8cebb] bg-[#efe7d8] px-5 py-4 text-[#1f1c17] placeholder:text-[#8d8579] focus:outline-none focus:ring-2 focus:ring-[#1f1c17]/20"
      />
    </div>
  );
}