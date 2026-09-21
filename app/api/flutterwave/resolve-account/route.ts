import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accountNumber, bankCode } = await req.json();

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Account number and bank code are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Account number must be 10 digits.",
        },
        { status: 400 }
      );
    }

    if (!process.env.FLW_SECRET_KEY) {
      console.error("FLW_SECRET_KEY is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Flutterwave configuration is missing.",
        },
        { status: 500 }
      );
    }

    console.log("VERIFYING BANK ACCOUNT:", {
      bankCode,
      accountNumber,
    });

    const response = await fetch(
      "https://api.flutterwave.com/v3/accounts/resolve",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_number: accountNumber,
          account_bank: bankCode,
        }),
      }
    );

    const data = await response.json();

    console.log("FLUTTERWAVE ACCOUNT VERIFY RESPONSE:", {
      status: response.status,
      data,
    });

    if (!response.ok || data.status !== "success") {
  console.error("FLUTTERWAVE RAW ERROR:", JSON.stringify(data, null, 2));

  return NextResponse.json(
    {
      success: false,
      message: data.message || "Flutterwave rejected the account verification.",
      flutterwaveResponse: data,
    },
    { status: 400 }
  );
}

    return NextResponse.json({
      success: true,
      accountName: data.data.account_name,
      accountNumber: data.data.account_number,
    });
  } catch (error) {
    console.error("FLUTTERWAVE ACCOUNT RESOLUTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while verifying the account.",
      },
      { status: 500 }
    );
  }
}