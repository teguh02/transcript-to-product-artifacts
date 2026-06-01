import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

export async function generateJson(prompt: string) {
  const openai = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || "gpt-5.4";

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a precise AI assistant that returns strict JSON responses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content;
}

export async function transcribeAudio(file: File) {
  const openai = getOpenAIClient();
  const model = process.env.OPENAI_TRANSCRIPTION_MODEL || "whisper-1";

  const response = await openai.audio.transcriptions.create({
    file,
    model,
  });

  if (!response.text) {
    throw new Error("OpenAI returned an empty transcription.");
  }

  return response.text;
}
