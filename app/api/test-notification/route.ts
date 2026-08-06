import { NextResponse } from "next/server";
import { sendNotification } from "@/lib/sendNotification";

export async function GET() {
  await sendNotification({
    userId: "0e57f8ef-d404-4ced-ab89-d5195f2733b6",
    title: "Bitevy Test 🚀",
    body: "This notification came from sendNotification().",
  });

  return NextResponse.json({ success: true });
}