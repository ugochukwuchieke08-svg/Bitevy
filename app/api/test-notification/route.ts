import "@/lib/firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { NextResponse } from "next/server";

export async function GET() {
  const message = {
    notification: {
      title: "Bitevy Test",
      body: "Firebase is connected 🚀",
    },
    token:
      "dfZ8s9NwRAqkX0y3xvJenf:APA91bH4DbzT-lZH3S9-qK79FkbwPRGzWIDJzmmljYkMVnlvxssbK5cS-Xamt_dmXoGAFJyR8zO57R20UYSVMIQTQW6_ZDvctmZ7hJj1iOcWxnuvbeFpw",
  };

  const response = await getMessaging().send(message);

  return NextResponse.json({
    success: true,
    response,
  });
}