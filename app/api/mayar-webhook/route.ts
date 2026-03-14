import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log("MAYAR WEBHOOK RECEIVED:", payload);

    // TODO:
    // - verify webhook signature if Mayar provides one
    // - update payment status in database
    // - activate premium recipe pack / subscription

    return NextResponse.json({
      received: true,
      message: "Webhook processed successfully.",
    });
  } catch (error) {
    console.error("MAYAR WEBHOOK ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to process webhook.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}