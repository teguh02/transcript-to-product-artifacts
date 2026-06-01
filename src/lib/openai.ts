import OpenAI from "openai";

let client: OpenAI | null = null;
const MIN_TIMEOUT_MS = 10_000;
const MAX_TIMEOUT_MS = 40_000;
const DEFAULT_TIMEOUT_MS = 40_000;
const MIN_COMPLETION_TOKENS = 600;
const MAX_COMPLETION_TOKENS = 2_200;
const DEFAULT_COMPLETION_TOKENS = 1_600;

function getTextGenerationModel() {
  return process.env.OPENAI_MODEL || "gpt-5-mini";
}

function getOpenAITimeoutMs() {
  const timeout = Number(process.env.OPENAI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  if (!Number.isFinite(timeout)) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, timeout));
}

function getMaxCompletionTokens() {
  const maxTokens = Number(process.env.OPENAI_MAX_COMPLETION_TOKENS || DEFAULT_COMPLETION_TOKENS);

  if (!Number.isFinite(maxTokens)) {
    return DEFAULT_COMPLETION_TOKENS;
  }

  return Math.min(MAX_COMPLETION_TOKENS, Math.max(MIN_COMPLETION_TOKENS, Math.trunc(maxTokens)));
}

function isRetryableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("rate limit") ||
    message.includes("overloaded") ||
    message.includes("temporarily unavailable")
  );
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
  const maxCompletionTokens = getMaxCompletionTokens();

  const baseRequest = {
    model,
    messages: [
      {
        role: "system" as const,
        content: "You are a precise AI assistant that returns strict JSON responses.",
      },
      {
        role: "user" as const,
        content: prompt,
      },
    ],
    response_format: { type: "json_object" as const },
  };

  let response;

  try {
    response = await openai.chat.completions.create({
      ...baseRequest,
      max_completion_tokens: maxCompletionTokens,
    });
  } catch (error) {
    if (!isRetryableError(error)) {
      throw error;
    }

    response = await openai.chat.completions.create({
      ...baseRequest,
      max_completion_tokens: Math.max(MIN_COMPLETION_TOKENS, Math.trunc(maxCompletionTokens * 0.75)),
    });
  }

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
