import { z } from "zod";

function stringifyPrimitive(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function normalizeObjectToText(value: Record<string, unknown>): string {
  const namedValue = stringifyPrimitive(value.name);
  const roleValue = stringifyPrimitive(value.role);

  if (namedValue && roleValue) {
    return `${namedValue} (${roleValue})`;
  }

  const preferredKeys = [
    "name",
    "title",
    "summary",
    "description",
    "problem",
    "goal",
    "feature",
    "signal",
    "metric",
    "label",
    "value",
  ] as const;

  for (const key of preferredKeys) {
    const normalized = stringifyPrimitive(value[key]);

    if (normalized) {
      return normalized;
    }
  }

  const flattened = Object.values(value)
    .flatMap((entry) => {
      if (Array.isArray(entry)) {
        return entry.map((item) => stringifyPrimitive(item)).filter(Boolean);
      }

      return stringifyPrimitive(entry);
    })
    .filter(Boolean);

  return flattened.join(" - ");
}

const flexibleStringItemSchema = z
  .union([z.string(), z.record(z.unknown())])
  .transform((value, ctx) => {
    const normalized = typeof value === "string" ? value.trim() : normalizeObjectToText(value);

    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Could not normalize item into text.",
      });

      return z.NEVER;
    }

    return normalized;
  });

export const analysisSchema = z.object({
  productName: z.string(),
  summary: z.string(),
  actors: z.array(flexibleStringItemSchema),
  problems: z.array(flexibleStringItemSchema),
  goals: z.array(z.string()),
  featureIdeas: z.array(flexibleStringItemSchema),
  constraints: z.array(flexibleStringItemSchema),
  nonFunctionalSignals: z.array(flexibleStringItemSchema),
  successSignals: z.array(flexibleStringItemSchema),
  assumptions: z.array(flexibleStringItemSchema),
  openQuestions: z.array(flexibleStringItemSchema),
});

export const prdSchema = z.object({
  productOverview: z.string(),
  problemStatement: z.string(),
  goals: z.array(z.string()),
  userPersonas: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      needs: z.array(z.string()),
      painPoints: z.array(z.string()),
    }),
  ),
  userJourney: z.array(
    z.object({
      step: z.string(),
      description: z.string(),
    }),
  ),
  features: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
  functionalRequirements: z.array(z.string()),
  nonFunctionalRequirements: z.array(z.string()),
  successMetrics: z.array(z.string()),
});

export const userStoriesSchema = z.object({
  userStories: z.array(
    z.object({
      id: z.string(),
      role: z.string(),
      action: z.string(),
      benefit: z.string(),
      story: z.string(),
    }),
  ),
});

export const functionalRequirementsSchema = z.object({
  functionalRequirements: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
      relatedStories: z.array(z.string()),
    }),
  ),
});

export const productArtifactsSchema = z.object({
  prd: prdSchema,
  userStories: userStoriesSchema.shape.userStories,
  functionalRequirements: functionalRequirementsSchema.shape.functionalRequirements,
});

export const uiUxSchema = z.object({
  sitemap: z.array(
    z.object({
      name: z.string(),
      purpose: z.string(),
      children: z.array(flexibleStringItemSchema),
    }),
  ),
  screenList: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      purpose: z.string(),
      primaryUser: z.string(),
      keyFeatures: z.array(flexibleStringItemSchema),
    }),
  ),
  userFlow: z.array(
    z.object({
      step: z.number(),
      screen: z.string(),
      userAction: z.string(),
      systemResponse: z.string(),
    }),
  ),
  wireframes: z.array(
    z.object({
      screenId: z.string(),
      screenName: z.string(),
      goal: z.string(),
      layout: z.string(),
      primaryAction: z.string(),
      sections: z.array(
        z.object({
          name: z.string(),
          components: z.array(flexibleStringItemSchema),
        }),
      ),
      notes: z.array(flexibleStringItemSchema),
    }),
  ),
});

export const validationSchema = z.object({
  consistencyScore: z.number().min(0).max(100),
  issues: z.array(flexibleStringItemSchema),
  fixSuggestions: z.array(flexibleStringItemSchema),
});

export const generationRequestSchema = z.object({
  transcript: z.string().min(20, "Transcript must be at least 20 characters long."),
});

export const generationResultSchema = z.object({
  input: z.object({
    transcript: z.string(),
  }),
  analysis: analysisSchema,
  prd: prdSchema,
  userStories: userStoriesSchema.shape.userStories,
  functionalRequirements: functionalRequirementsSchema.shape.functionalRequirements,
  uiUx: uiUxSchema,
  validation: validationSchema,
});

export const fullArtifactsSchema = z.object({
  prd: prdSchema,
  userStories: userStoriesSchema.shape.userStories,
  functionalRequirements: functionalRequirementsSchema.shape.functionalRequirements,
  uiUx: uiUxSchema,
  validation: validationSchema,
});

export function parseJsonResponse<T>(content: string, schema: z.ZodSchema<T>): T {
  const parsed = JSON.parse(content);
  return schema.parse(parsed);
}
