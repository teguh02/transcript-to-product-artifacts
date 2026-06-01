import { NextResponse } from "next/server";
import { generateJson } from "@/lib/openai";
import {
  buildAnalysisPrompt,
  buildProductArtifactsPrompt,
  buildUiUxPrompt,
  buildValidationPrompt,
} from "@/lib/prompts";
import {
  analysisSchema,
  generationRequestSchema,
  generationResultSchema,
  parseJsonResponse,
  productArtifactsSchema,
  uiUxSchema,
  validationSchema,
} from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript } = generationRequestSchema.parse(body);

    const analysis = parseJsonResponse(await generateJson(buildAnalysisPrompt(transcript)), analysisSchema);

    const productArtifactsContent = await generateJson(buildProductArtifactsPrompt(JSON.stringify(analysis, null, 2)));
    const productArtifacts = parseJsonResponse(
      productArtifactsContent,
      productArtifactsSchema,
    );

    const uiUx = parseJsonResponse(
      await generateJson(
        buildUiUxPrompt(
          JSON.stringify(
            {
              analysis,
              prd: productArtifacts.prd,
              userStories: productArtifacts.userStories,
              functionalRequirements: productArtifacts.functionalRequirements,
            },
            null,
            2,
          ),
        ),
      ),
      uiUxSchema,
    );

    const validation = parseJsonResponse(
      await generateJson(
        buildValidationPrompt(
          JSON.stringify(
            {
              analysis,
              prd: productArtifacts.prd,
              userStories: productArtifacts.userStories,
              functionalRequirements: productArtifacts.functionalRequirements,
              uiUx,
            },
            null,
            2,
          ),
        ),
      ),
      validationSchema,
    );

    const result = generationResultSchema.parse({
      input: { transcript },
      analysis,
      prd: productArtifacts.prd,
      userStories: productArtifacts.userStories,
      functionalRequirements: productArtifacts.functionalRequirements,
      uiUx,
      validation,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error while generating artifacts.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
