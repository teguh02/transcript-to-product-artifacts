import { NextResponse } from "next/server";
import { generateJson } from "@/lib/openai";
import { buildOneShotArtifactsPrompt } from "@/lib/prompts";
import {
  fullArtifactsSchema,
  generationRequestSchema,
  generationResultSchema,
  parseJsonResponse,
} from "@/lib/schemas";
import type { GenerationResult, Validation } from "@/types/artifacts";

export const maxDuration = 60;

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

  return {
    consistencyScore: Math.max(0, score),
    issues,
    fixSuggestions,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript } = generationRequestSchema.parse(body);

    const fullArtifacts = parseJsonResponse(
      await generateJson(buildOneShotArtifactsPrompt(transcript)),
      fullArtifactsSchema,
    );

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

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while generating artifacts.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
