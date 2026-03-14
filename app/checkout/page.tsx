"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Crown, CreditCard, Sparkles } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "MakanMate User",
          email: "demo@makanmate.app",
          mobile: "081234567890",
          amount: 49000,
          description: "MakanMate Premium Membership",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          typeof data.detail === "string"
            ? data.detail
            : typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.detail || data.error || data, null, 2);

        throw new Error(message);
      }

      const paymentUrl =
        data?.payment_url ||
        data?.data?.data?.link ||
        data?.data?.link;

      if (!paymentUrl) {
        throw new Error("Mayar payment link was not returned.");
      }

      window.location.href = paymentUrl;
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#efe7d8] px-6 py-12 text-[#1f1c17] md:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push("/")}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#d3c6b4] bg-[#f7f1e8] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] transition hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[32px] border border-[#d8cebb] bg-[#f7f1e8] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7a7469]">
            Premium Membership
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Join premium with Mayar
          </h1>

          <p className="mt-4 max-w-3xl leading-8 text-[#635d54]">
            Unlock unlimited recipe generation, richer culinary recommendations,
            Michelin-inspired menu ideas, and exclusive famous chef-style recipe collections.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-5">
              <div className="flex items-center gap-2 text-[#7a7469]">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Feature 1
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold">Unlimited recipes</p>
            </div>

            <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-5">
              <div className="flex items-center gap-2 text-[#7a7469]">
                <Crown className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Feature 2
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold">
                Michelin-inspired menus
              </p>
            </div>

            <div className="rounded-[24px] border border-[#ddd2c0] bg-white/60 p-5">
              <div className="flex items-center gap-2 text-[#7a7469]">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Payment
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold">Powered by Mayar</p>
            </div>
          </div>

          <div className="mt-8 rounded-[24px] border border-[#ddd2c0] bg-white/60 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7a7469]">
              Membership price
            </p>
            <p className="mt-3 text-3xl font-semibold">Rp49.000</p>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="mt-8 rounded-full bg-[#1f1c17] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black disabled:opacity-60"
          >
            {loading ? "Processing..." : "Continue with Mayar"}
          </button>
        </div>
      </div>
    </main>
  );
}