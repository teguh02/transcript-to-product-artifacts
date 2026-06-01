import OpenAI from "openai";

let client: OpenAI | null = null;

function getTextGenerationModel() {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

function getOpenAITimeoutMs() {
  return Number(process.env.OPENAI_TIMEOUT_MS || 25000);
}

function getMaxCompletionTokens() {
  return Number(process.env.OPENAI_MAX_COMPLETION_TOKENS || 2500);
}

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey,
      timeout: getOpenAITimeoutMs(),
      maxRetries: 0,
    });
  }

  return client;
}

export async function generateJson(prompt: string) {
  const openai = getOpenAIClient();
  const model = getTextGenerationModel();

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
    temperature: 0.2,
    max_completion_tokens: getMaxCompletionTokens(),
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
