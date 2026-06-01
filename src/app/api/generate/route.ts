import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { MAX_ACCEPTED_TRANSCRIPT_CHARS, MAX_PROMPT_TRANSCRIPT_CHARS } from "@/lib/generation-config";
import { generateJson } from "@/lib/openai";
import { buildOneShotArtifactsPrompt } from "@/lib/prompts";
import {
  fullArtifactsSchema,
  generationRequestSchema,
  generationResultSchema,
  parseRawJsonResponse,
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

function toText(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    for (const key of ["name", "title", "summary", "description", "label", "value", "text", "content"] as const) {
      const candidate = objectValue[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return fallback;
}

function toTextArray(value: unknown) {
  if (!Array.isArray(value)) {
    return typeof value === "string" && value.trim() ? [value.trim()] : [];
  }

  return value.map((item) => toText(item)).filter(Boolean);
}

function toRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function toArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function normalizeFullArtifactsPayload(raw: unknown) {
  const root = toRecord(raw);
  const analysis = toRecord(root.analysis);
  const prd = toRecord(root.prd);
  const uiUx = toRecord(root.uiUx);

  return {
    analysis: {
      productName: toText(analysis.productName),
      summary: toText(analysis.summary),
      actors: toTextArray(analysis.actors),
      problems: toTextArray(analysis.problems),
      goals: toTextArray(analysis.goals),
      featureIdeas: toTextArray(analysis.featureIdeas),
      constraints: toTextArray(analysis.constraints),
      nonFunctionalSignals: toTextArray(analysis.nonFunctionalSignals),
      successSignals: toTextArray(analysis.successSignals),
      assumptions: toTextArray(analysis.assumptions),
      openQuestions: toTextArray(analysis.openQuestions),
    },
    prd: {
      productOverview: toText(prd.productOverview),
      problemStatement: toText(prd.problemStatement),
      goals: toTextArray(prd.goals),
      userPersonas: toArray(prd.userPersonas).map((item) => {
        const persona = toRecord(item);
        return {
          name: toText(persona.name),
          role: toText(persona.role),
          needs: toTextArray(persona.needs),
          painPoints: toTextArray(persona.painPoints),
        };
      }),
      userJourney: toArray(prd.userJourney).map((item) => {
        const step = toRecord(item);
        return {
          step: toText(step.step),
          description: toText(step.description),
        };
      }),
      features: toArray(prd.features).map((item) => {
        const feature = toRecord(item);
        return {
          name: toText(feature.name),
          description: toText(feature.description),
        };
      }),
      functionalRequirements: toTextArray(prd.functionalRequirements),
      nonFunctionalRequirements: toTextArray(prd.nonFunctionalRequirements),
      successMetrics: toTextArray(prd.successMetrics),
    },
    userStories: toArray(root.userStories).map((item, index) => {
      const story = toRecord(item);
      const id = toText(story.id) || `US-${String(index + 1).padStart(3, "0")}`;
      const role = toText(story.role);
      const action = toText(story.action);
      const benefit = toText(story.benefit);

      return {
        id,
        role,
        action,
        benefit,
        story: toText(story.story) || `As a ${role || "user"}, I want ${action || "to complete a task"} so that ${benefit || "I can achieve the desired outcome"}.`,
      };
    }),
    functionalRequirements: toArray(root.functionalRequirements).map((item, index) => {
      const requirement = toRecord(item);
      const priority = toText(requirement.priority, "Medium");

      return {
        id: toText(requirement.id) || `FR-${String(index + 1).padStart(3, "0")}`,
        title: toText(requirement.title),
        description: toText(requirement.description),
        priority: priority === "High" || priority === "Low" ? priority : "Medium",
        relatedStories: toTextArray(requirement.relatedStories),
      };
    }),
    uiUx: {
      sitemap: toArray(uiUx.sitemap).map((item) => {
        const node = toRecord(item);
        return {
          name: toText(node.name),
          purpose: toText(node.purpose),
          children: toTextArray(node.children),
        };
      }),
      screenList: toArray(uiUx.screenList).map((item, index) => {
        const screen = toRecord(item);
        return {
          id: toText(screen.id) || `SCR-${String(index + 1).padStart(3, "0")}`,
          name: toText(screen.name),
          purpose: toText(screen.purpose),
          primaryUser: toText(screen.primaryUser),
          keyFeatures: toTextArray(screen.keyFeatures),
        };
      }),
      userFlow: toArray(uiUx.userFlow).map((item, index) => {
        const step = toRecord(item);
        const parsedStep = Number(step.step);
        return {
          step: Number.isFinite(parsedStep) ? parsedStep : index + 1,
          screen: toText(step.screen),
          userAction: toText(step.userAction),
          systemResponse: toText(step.systemResponse),
        };
      }),
      wireframes: toArray(uiUx.wireframes).map((item, index) => {
        const wireframe = toRecord(item);
        return {
          screenId: toText(wireframe.screenId) || `SCR-${String(index + 1).padStart(3, "0")}`,
          screenName: toText(wireframe.screenName),
          goal: toText(wireframe.goal),
          layout: toText(wireframe.layout),
          primaryAction: toText(wireframe.primaryAction),
          sections: toArray(wireframe.sections).map((sectionItem) => {
            const section = toRecord(sectionItem);
            return {
              name: toText(section.name),
              components: toTextArray(section.components),
            };
          }),
          notes: toTextArray(wireframe.notes),
        };
      }),
    },
  };
}

function summarizeArtifactsPayload(payload: ReturnType<typeof normalizeFullArtifactsPayload>) {
  return {
    analysisActors: payload.analysis.actors.length,
    analysisProblems: payload.analysis.problems.length,
    analysisGoals: payload.analysis.goals.length,
    personas: payload.prd.userPersonas.length,
    features: payload.prd.features.length,
    userStories: payload.userStories.length,
    functionalRequirements: payload.functionalRequirements.length,
    sitemapNodes: payload.uiUx.sitemap.length,
    screens: payload.uiUx.screenList.length,
    userFlowSteps: payload.uiUx.userFlow.length,
    wireframes: payload.uiUx.wireframes.length,
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
    const rawModelResponse = parseRawJsonResponse(await generateJson(prompt));
    const openAiDurationMs = Date.now() - openAiStartedAt;

    console.info("[generate] raw model response parsed", {
      openAiDurationMs,
      rootKeys: Object.keys(toRecord(rawModelResponse)),
    });

    const normalizeArtifactsStartedAt = Date.now();
    const normalizedArtifacts = normalizeFullArtifactsPayload(rawModelResponse);
    const normalizeArtifactsDurationMs = Date.now() - normalizeArtifactsStartedAt;

    console.info("[generate] artifacts normalized", {
      normalizeArtifactsDurationMs,
      summary: summarizeArtifactsPayload(normalizedArtifacts),
    });

    const schemaParseStartedAt = Date.now();
    const fullArtifacts = fullArtifactsSchema.parse(normalizedArtifacts);
    const schemaParseDurationMs = Date.now() - schemaParseStartedAt;

    console.info("[generate] artifacts schema validated", {
      schemaParseDurationMs,
    });

    const withoutValidation: Omit<GenerationResult, "validation"> = {
      input: { transcript },
      analysis: fullArtifacts.analysis as GenerationResult["analysis"],
      prd: fullArtifacts.prd,
      userStories: fullArtifacts.userStories,
      functionalRequirements: fullArtifacts.functionalRequirements,
      uiUx: fullArtifacts.uiUx as GenerationResult["uiUx"],
    };

    const validation = buildLocalValidation(withoutValidation);

    console.info("[generate] local validation computed", {
      consistencyScore: validation.consistencyScore,
      issues: validation.issues.length,
      fixSuggestions: validation.fixSuggestions.length,
    });

    const result = generationResultSchema.parse({
      ...withoutValidation,
      validation,
    });

    console.info("[generate] request completed", {
      totalDurationMs: Date.now() - requestStartedAt,
      openAiDurationMs,
      normalizedArtifactsSummary: summarizeArtifactsPayload(normalizedArtifacts),
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
