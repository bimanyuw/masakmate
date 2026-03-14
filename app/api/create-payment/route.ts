import { NextResponse } from "next/server";

const MAYAR_API_KEY = process.env.MAYAR_API_KEY;
const MAYAR_BASE_URL =
  process.env.MAYAR_BASE_URL || "https://api.mayar.id/hl/v1";

type PaymentBody = {
  name?: string;
  email?: string;
  mobile?: string;
  amount?: number;
  description?: string;
};

export async function POST(req: Request) {
  try {
    if (!MAYAR_API_KEY) {
      return NextResponse.json(
        { error: "MAYAR_API_KEY is missing." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as PaymentBody;

    const name = body.name?.trim() || "MakanMate User";
    const email = body.email?.trim() || "";
    const mobile = body.mobile?.trim() || "081234567890";
    const amount = Number(body.amount || 0);
    const description =
      body.description?.trim() || "MakanMate Premium Membership";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!mobile) {
      return NextResponse.json(
        { error: "Mobile number is required." },
        { status: 400 }
      );
    }

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { error: "Amount must be at least Rp1.000." },
        { status: 400 }
      );
    }

    const redirectUrl = "http://localhost:3000/checkout/success";
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const payload = {
      name,
      email,
      mobile,
      redirectUrl,
      description,
      expiredAt,
      items: [
        {
          quantity: 1,
          rate: amount,
          description,
        },
      ],
      extraData: {
        noCustomer: `MM-${Date.now()}`,
        idProd: "makanmate-premium-membership",
      },
    };

    const mayarRes = await fetch(`${MAYAR_BASE_URL}/invoice/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAYAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const mayarData = await mayarRes.json().catch(() => null);

    console.log("MAYAR STATUS:", mayarRes.status);
    console.log("MAYAR RESPONSE:", mayarData);

    if (!mayarRes.ok) {
      const readableDetail =
        typeof mayarData === "string"
          ? mayarData
          : mayarData?.messages ||
            mayarData?.message ||
            mayarData?.error ||
            mayarData?.detail ||
            JSON.stringify(mayarData, null, 2);

      return NextResponse.json(
        {
          error: "Failed to create payment.",
          detail: readableDetail,
          raw: mayarData,
        },
        { status: mayarRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: mayarData,
      payment_url: mayarData?.data?.link || null,
    });
  } catch (error) {
    console.error("MAYAR CREATE PAYMENT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create payment.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}