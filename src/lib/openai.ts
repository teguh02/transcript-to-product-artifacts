import OpenAI from "openai";

let client: OpenAI | null = null;
const OPENAI_TIMEOUT_MS = 40_000;
const TEXT_MODEL_CANDIDATES = ["gpt-5-mini", "gpt-4.1-mini", "gpt-4o-mini"] as const;
const TRANSCRIPTION_MODEL = "whisper-1";
const DEFAULT_COMPLETION_TOKENS = 1_200;
const RETRY_COMPLETION_TOKENS = 900;
const MAX_MODEL_ATTEMPTS = 2;

type TokenStyle = "max_completion_tokens" | "max_tokens";
type ResponseFormatMode = "json_object" | "plain_text";

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

function isCompatibilityError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    (message.includes("model") && (message.includes("does not exist") || message.includes("not found"))) ||
    message.includes("unsupported parameter") ||
    message.includes("not supported with this model") ||
    message.includes("response_format")
  );
}

function buildCompletionRequest({
  model,
  prompt,
  maxTokens,
  tokenStyle,
  responseFormatMode,
}: {
  model: string;
  prompt: string;
  maxTokens: number;
  tokenStyle: TokenStyle;
  responseFormatMode: ResponseFormatMode;
}) {
  const request: Record<string, unknown> = {
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
  };

  request[tokenStyle] = maxTokens;

  if (responseFormatMode === "json_object") {
    request.response_format = { type: "json_object" };
  }

  return request;
}

async function callChatCompletionWithFallback(prompt: string) {
  const openai = getOpenAIClient();
  const requestVariants: ReadonlyArray<{ tokenStyle: TokenStyle; responseFormatMode: ResponseFormatMode }> = [
    { tokenStyle: "max_completion_tokens", responseFormatMode: "json_object" },
    { tokenStyle: "max_tokens", responseFormatMode: "json_object" },
    { tokenStyle: "max_completion_tokens", responseFormatMode: "plain_text" },
    { tokenStyle: "max_tokens", responseFormatMode: "plain_text" },
  ];

  let lastError: unknown;

  for (const model of TEXT_MODEL_CANDIDATES) {
    for (const requestVariant of requestVariants) {
      for (let attempt = 1; attempt <= MAX_MODEL_ATTEMPTS; attempt += 1) {
        const maxTokens = attempt === 1 ? DEFAULT_COMPLETION_TOKENS : RETRY_COMPLETION_TOKENS;

        try {
          const response = await openai.chat.completions.create(
            buildCompletionRequest({
              model,
              prompt,
              maxTokens,
              tokenStyle: requestVariant.tokenStyle,
              responseFormatMode: requestVariant.responseFormatMode,
            }) as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
          );

          const content = response.choices[0]?.message?.content;

          if (!content) {
            throw new Error("OpenAI returned an empty response.");
          }

          return content;
        } catch (error) {
          lastError = error;

          if (isCompatibilityError(error)) {
            break;
          }

          if (isRetryableError(error) && attempt < MAX_MODEL_ATTEMPTS) {
            continue;
          }

          break;
        }
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("OpenAI request failed for all configured model and parameter fallbacks.");
}

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey,
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: 0,
    });
  }

  return client;
}

export async function generateJson(prompt: string) {
  const content = await callChatCompletionWithFallback(prompt);
  return content;
}

export async function transcribeAudio(file: File) {
  const openai = getOpenAIClient();

  const response = await openai.audio.transcriptions.create({
    file,
    model: TRANSCRIPTION_MODEL,
  });

  if (!response.text) {
    throw new Error("OpenAI returned an empty transcription.");
  }

  return response.text;
}
