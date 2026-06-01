import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { MAX_ACCEPTED_TRANSCRIPT_CHARS, MAX_PROMPT_TRANSCRIPT_CHARS } from "@/lib/generation-config";
import { generateJson } from "@/lib/openai";
import { buildOneShotArtifactsPrompt } from "@/lib/prompts";
import {
  fullArtifactsSchema,
  generationRequestSchema,
  generationResultSchema,
  parseJsonResponse,
} from "@/lib/schemas";
import type { GenerationResult, Validation } from "@/types/artifacts";

export const maxDuration = 30;

function normalizeTranscriptForGeneration(transcript: string) {
  const normalized = transcript.replace(/\s+/g, " ").trim();

  if (normalized.length <= MAX_PROMPT_TRANSCRIPT_CHARS) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_PROMPT_TRANSCRIPT_CHARS)}…`;
}

function classifyApiError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      status: 400,
      message: error.issues[0]?.message ?? "Invalid request payload.",
      code: "validation_error",
    };
  }

  if (!(error instanceof Error)) {
    return {
      status: 500,
      message: "Unexpected error while generating artifacts.",
      code: "unknown_error",
    };
  }

  const message = error.message.toLowerCase();

  if (message.includes("missing openai_api_key")) {
    return {
      status: 500,
      message: "Server is not configured with OPENAI_API_KEY.",
      code: "missing_api_key",
    };
  }

  if (message.includes("timeout") || message.includes("timed out")) {
    return {
      status: 504,
      message: "Generation timed out. Try a shorter transcript or retry.",
      code: "upstream_timeout",
    };
  }

  if (message.includes("json") || message.includes("schema")) {
    return {
      status: 502,
      message: "Model returned an invalid response format. Please retry.",
      code: "response_parse_error",
    };
  }

  return {
    status: 500,
    message: error.message || "Unexpected error while generating artifacts.",
    code: "generation_error",
  };
}

function buildLocalValidation(result: Omit<GenerationResult, "validation">): Validation {
  const issues: string[] = [];
  const fixSuggestions: string[] = [];
  let score = 100;

  if (result.prd.goals.length === 0) {
    score -= 15;
    issues.push("No explicit goals were generated from the transcript.");
  }

  if (result.userStories.length === 0) {
    score -= 15;
    issues.push("No user stories were generated.");
  }

  if (result.functionalRequirements.length === 0) {
    score -= 20;
    issues.push("No functional requirements were generated.");
  }

  if (result.uiUx.screenList.length === 0) {
    score -= 20;
    issues.push("No screen list was generated for the UI/UX output.");
  }

  if (result.uiUx.wireframes.length === 0) {
    score -= 20;
    issues.push("No wireframes were generated.");
  }

  if (result.analysis.assumptions.length > 5) {
    score -= 10;
    issues.push("A high number of assumptions suggests the transcript may be ambiguous.");
  }

  if (issues.length > 0) {
    fixSuggestions.push("Provide a transcript with clearer product goals, target users, and expected outcomes.");
  }

  if (result.functionalRequirements.length === 0 || result.userStories.length === 0) {
    fixSuggestions.push("State the main workflow and feature expectations more explicitly in the meeting transcript.");
  }

  if (result.uiUx.screenList.length === 0 || result.uiUx.wireframes.length === 0) {
    fixSuggestions.push("Mention the intended screens, user journey, or key interface steps more directly in the transcript.");
  }

  if (result.analysis.assumptions.length > 5) {
    fixSuggestions.push("Reduce ambiguity by specifying constraints, feature priorities, and user roles in the source meeting notes.");
  }

  const cappedIssues = issues.slice(0, 3);
  const cappedFixSuggestions = fixSuggestions.slice(0, 3);

  return {
    consistencyScore: Math.max(0, score),
    issues: cappedIssues,
    fixSuggestions: cappedFixSuggestions,
  };
}

export async function POST(request: Request) {
  const requestStartedAt = Date.now();

  try {
    const parseStartedAt = Date.now();
    const body = await request.json();
    const { transcript } = generationRequestSchema.parse(body);
    const parseDurationMs = Date.now() - parseStartedAt;

    if (transcript.length > MAX_ACCEPTED_TRANSCRIPT_CHARS) {
      return NextResponse.json(
        {
          error: `Transcript is too long. Maximum ${MAX_ACCEPTED_TRANSCRIPT_CHARS} characters allowed.`,
          code: "transcript_too_long",
        },
        { status: 400 },
      );
    }

    const normalizeStartedAt = Date.now();
    const normalizedTranscript = normalizeTranscriptForGeneration(transcript);
    const normalizeDurationMs = Date.now() - normalizeStartedAt;
    const prompt = buildOneShotArtifactsPrompt(normalizedTranscript);

    console.info("[generate] request accepted", {
      originalTranscriptChars: transcript.length,
      normalizedTranscriptChars: normalizedTranscript.length,
      promptChars: prompt.length,
      parseDurationMs,
      normalizeDurationMs,
    });

    const openAiStartedAt = Date.now();
    const fullArtifacts = parseJsonResponse(await generateJson(prompt), fullArtifactsSchema);
    const openAiDurationMs = Date.now() - openAiStartedAt;

    const withoutValidation: Omit<GenerationResult, "validation"> = {
      input: { transcript },
      analysis: fullArtifacts.analysis as GenerationResult["analysis"],
      prd: fullArtifacts.prd,
      userStories: fullArtifacts.userStories,
      functionalRequirements: fullArtifacts.functionalRequirements,
      uiUx: fullArtifacts.uiUx as GenerationResult["uiUx"],
    };

    const validation = buildLocalValidation(withoutValidation);

    const result = generationResultSchema.parse({
      ...withoutValidation,
      validation,
    });

    console.info("[generate] request completed", {
      totalDurationMs: Date.now() - requestStartedAt,
      openAiDurationMs,
    });

    return NextResponse.json(result);
  } catch (error) {
    const classified = classifyApiError(error);

    console.error("[generate] request failed", {
      code: classified.code,
      status: classified.status,
      totalDurationMs: Date.now() - requestStartedAt,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: classified.message, code: classified.code }, { status: classified.status });
  }
}
