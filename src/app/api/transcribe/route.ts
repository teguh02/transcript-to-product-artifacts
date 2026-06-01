import { NextResponse } from "next/server";

export const maxDuration = 10;

export async function POST() {
  return NextResponse.json(
    {
      error: "Audio transcription is disabled in prototype mode. Use sample transcript, text area, or upload .txt.",
      code: "transcription_disabled",
    },
    { status: 410 },
  );
}
