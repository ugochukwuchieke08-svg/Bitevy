import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      bankCode,
      accountNumber,
      businessName,
      businessEmail,
      businessMobile,
      businessContact,
    } = await req.json();

    if (
      !bankCode ||
      !accountNumber ||
      !businessName ||
      !businessEmail ||
      !businessMobile
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required payout information.",
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

    const response = await fetch(
      "https://api.flutterwave.com/v3/subaccounts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_bank: bankCode,
          account_number: accountNumber,
          business_name: businessName,
          business_email: businessEmail,
          business_mobile: businessMobile,
          business_contact: businessContact || businessName,
          country: "NG",

          // Temporary default.
          // We will determine the actual Bitevy split
          // when we connect this to checkout.
          split_type: "percentage",
          split_value: 0,
        }),
      }
    );

    const data = await response.json();

    console.log("FLUTTERWAVE SUBACCOUNT RESPONSE:", data);

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message || "Unable to create Flutterwave subaccount.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subaccountId: data.data.subaccount_id,
      flutterwaveId: data.data.id,
      accountName: data.data.full_name,
      bankName: data.data.bank_name,
    });
  } catch (error) {
    console.error("CREATE SUBACCOUNT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the payout account.",
      },
      { status: 500 }
    );
  }
}