import { NextResponse } from "next/server";

export async function GET() {
  try {
    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      console.error("FLW_SECRET_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Flutterwave configuration is missing.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.flutterwave.com/v3/banks/NG",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    console.log("FLUTTERWAVE BANKS RESPONSE:", {
      status: response.status,
      data,
    });

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message ||
            data.data?.message ||
            "Flutterwave could not load the banks.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      banks: data.data,
    });
  } catch (error) {
    console.error("BANK LIST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while fetching banks.",
      },
      { status: 500 }
    );
  }
}