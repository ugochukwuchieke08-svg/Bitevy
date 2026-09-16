import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.flutterwave.com/v3/banks/NG",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      console.error("FLUTTERWAVE BANKS ERROR:", data);

      return NextResponse.json(
        {
          success: false,
          message: data.message || "Unable to fetch banks.",
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