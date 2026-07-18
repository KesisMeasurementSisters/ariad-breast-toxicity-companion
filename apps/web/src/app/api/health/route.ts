import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ariad-breast",
    releaseId: process.env.CONTENT_RELEASE_ID ?? null,
    aiEnabled: process.env.ENABLE_GPT56 === "true" && Boolean(process.env.OPENAI_API_KEY),
  });
}

