import { NextResponse } from "next/server";
import { getMessaging } from "firebase-admin/messaging";
import "@/lib/firebase-admin";

export async function GET() {
  const messageId = await getMessaging().send({
    token: "dfZ8s9NwRAqkX0y3xvJenf:APA91bH4DbzT-lZH3S9-qK79FkbwPRGzWIDJzmmljYkMVnlvxssbK5cS-Xamt_dmXoGAFJyR8X4zO57R20UYSVMIQTQW6_ZDvctmZ7hJj1iOcWxnuvbeFpw",
    notification: {
      title: "Bitevy Test",
      body: "Firebase is connected 🚀",
    },
  });

  return NextResponse.json({
    success: true,
    messageId,
  });
}

    