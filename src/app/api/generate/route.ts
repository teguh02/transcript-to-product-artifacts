import { NextResponse } from "next/server";
import { generateJson } from "@/lib/openai";
import {
  buildAnalysisPrompt,
  buildFullArtifactsPrompt,
  buildProductArtifactsPrompt,
  buildUiUxPrompt,
  buildValidationPrompt,
} from "@/lib/prompts";
import {
  analysisSchema,
  fullArtifactsSchema,
  generationRequestSchema,
  generationResultSchema,
  parseJsonResponse,
} from "@/lib/schemas";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript } = generationRequestSchema.parse(body);

    const analysis = parseJsonResponse(await generateJson(buildAnalysisPrompt(transcript)), analysisSchema);

    const fullArtifacts = parseJsonResponse(
      await generateJson(buildFullArtifactsPrompt(JSON.stringify(analysis, null, 2))),
      fullArtifactsSchema,
    );

    const result = generationResultSchema.parse({
      input: { transcript },
      analysis,
      prd: fullArtifacts.prd,
      userStories: fullArtifacts.userStories,
      functionalRequirements: fullArtifacts.functionalRequirements,
      uiUx: fullArtifacts.uiUx,
      validation: fullArtifacts.validation,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while generating artifacts.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
