import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = typeof apiKey === "string" && apiKey.trim().length > 0;

  return NextResponse.json(
    {
      configured: isConfigured,
      provider: "gemini"
    },
    { status: 200 }
  );
}
