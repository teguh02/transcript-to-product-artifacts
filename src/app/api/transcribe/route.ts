import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/openai";

const acceptedAudioTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/webm",
]);

const maxFileSizeInBytes = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
    }

    if (fileEntry.size === 0) {
      return NextResponse.json({ error: "Uploaded audio file is empty." }, { status: 400 });
    }

    if (fileEntry.size > maxFileSizeInBytes) {
      return NextResponse.json({ error: "Audio file must be smaller than 25 MB." }, { status: 400 });
    }

    if (fileEntry.type && !acceptedAudioTypes.has(fileEntry.type)) {
      return NextResponse.json(
        { error: "Unsupported audio format. Use mp3, m4a, wav, or webm." },
        { status: 400 },
      );
    }

    const transcript = await transcribeAudio(fileEntry);

    return NextResponse.json({ transcript });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while transcribing audio.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
