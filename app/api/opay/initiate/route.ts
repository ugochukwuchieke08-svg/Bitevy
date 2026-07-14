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

    const payload = {
      country: "NG",
      reference: paymentReference,

      amount: {
        total: total * 100, // Kobo
        currency: "NGN",
      },

      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,

      callbackUrl:
        `${process.env.NEXT_PUBLIC_APP_URL}/api/opay/webhook`,

      cancelUrl:
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,

      userInfo: {
        userEmail: customerEmail,
        userId: orderId,
        userMobile: customerPhone,
        userName: customerName,
      },

      productList: [
        {
          productId: orderId,
          name: "Bitevy Food Order",
          description: "Food delivery order",
          price: total * 100,
          quantity: 1,
        },
      ],
    };

    const opayResponse = await fetch(
  `${process.env.OPAY_BASE_URL}/api/v1/international/cashier/create`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPAY_PUBLIC_KEY}`,
      MerchantId: process.env.OPAY_MERCHANT_ID!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);

const responseText = await opayResponse.text();

console.log("OPay Raw Response:", responseText);

const opayResult = JSON.parse(responseText);

  console.log("OPay Payload:", payload); 

if (
  !opayResponse.ok ||
  opayResult.code !== "00000"
) {
  return NextResponse.json(
    {
      error: opayResult.message,
      details: opayResult,
    },
    {
      status: 400,
    }
  );
}
   
    console.log({
      orderId,
      paymentReference,
      total,
      customerName,
      customerEmail,
      customerPhone,
    });

  return NextResponse.json({
    success: true,
    paymentUrl: opayResult.data.cashierUrl,
  });

  } 
  
 catch (err) {
  console.error(err);

  return NextResponse.json(
    {
      error: "Unable to initiate payment.",
    },
    {
      status: 500,
    }
  );
}

}