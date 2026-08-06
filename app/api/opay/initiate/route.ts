import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      orderId,
      paymentReference,
      total,
      customerName,
      customerEmail,
      customerPhone,
    } = await req.json();

    console.log("OPay bypass enabled", {
      orderId,
      paymentReference,
      total,
      customerName,
      customerEmail,
      customerPhone,
    });

    return NextResponse.json({
      success: true,
      bypass: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to process request.",
      },
      {
        status: 500,
      }
    );
  }
}