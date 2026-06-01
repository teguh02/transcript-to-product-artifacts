import OpenAI from "openai";
import { parseRawJsonResponse } from "@/lib/schemas";

let client: OpenAI | null = null;
const OPENAI_TIMEOUT_MS = 60000;
const DEFAULT_TEXT_MODEL = "gpt-5.5";
const TRANSCRIPTION_MODEL = "whisper-1";
const DEFAULT_COMPLETION_TOKENS = 8000;

type TokenStyle = "max_completion_tokens";
type ResponseFormatMode = "json_object" | "none";

function getResponsePreview(content: string) {
  return content.replace(/\s+/g, " ").slice(0, 220);
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

async function callChatCompletion(prompt: string) {
  const openai = getOpenAIClient();
  const model = DEFAULT_TEXT_MODEL;
  const responseFormatMode = "json_object";

  console.info("[openai] starting text generation", {
    model,
    promptChars: prompt.length,
    timeoutMs: OPENAI_TIMEOUT_MS,
    completionTokens: DEFAULT_COMPLETION_TOKENS,
  });

  const attemptStartedAt = Date.now();

  try {
    console.info("[openai] attempting completion", {
      model,
      responseFormatMode,
    });

    const response = await openai.chat.completions.create(
      buildCompletionRequest({
        model,
        prompt,
        maxTokens: DEFAULT_COMPLETION_TOKENS,
        tokenStyle: "max_completion_tokens",
        responseFormatMode,
      }) as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    console.info("[openai] completion received", {
      model,
      responseFormatMode,
      durationMs: Date.now() - attemptStartedAt,
      preview: getResponsePreview(content),
    });

    parseRawJsonResponse(content);

    console.info("[openai] completion accepted", {
      model,
      responseFormatMode,
    });

    return content;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[openai] completion attempt failed", {
      model,
      responseFormatMode,
      durationMs: Date.now() - attemptStartedAt,
      error: message,
    });
    throw error;
  }
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
  const content = await callChatCompletion(prompt);
  return content;
}

export async function transcribeAudio(file: File) {
  const openai = getOpenAIClient();
  const startedAt = Date.now();

  console.info("[openai] starting transcription", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    model: TRANSCRIPTION_MODEL,
  });

  const response = await openai.audio.transcriptions.create({
    file,
    model: TRANSCRIPTION_MODEL,
  });

  if (!response.text) {
    throw new Error("OpenAI returned an empty transcription.");
  }

  console.info("[openai] transcription completed", {
    durationMs: Date.now() - startedAt,
    transcriptChars: response.text.length,
  });

  return response.text;
}
