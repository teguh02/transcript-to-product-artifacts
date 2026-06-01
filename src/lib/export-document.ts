import type { GenerationResult } from "@/types/artifacts";

export type ExportRow = {
  label: string;
  value: string;
};

export type ExportTable = {
  title: string;
  headers: string[];
  rows: string[][];
};

export type ExportDocumentData = {
  title: string;
  subtitle: string;
  fileBaseName: string;
  generatedOn: string;
  executiveSummary: string;
  metadataRows: ExportRow[];
  overviewRows: ExportRow[];
  goals: string[];
  personas: ExportTable;
  userJourney: ExportTable;
  features: ExportTable;
  userStories: ExportTable;
  functionalRequirements: ExportTable;
  sitemap: ExportTable;
  screenList: ExportTable;
  userFlow: ExportTable;
  wireframeSummaries: Array<{
    title: string;
    rows: ExportRow[];
    sections: string[];
    notes: string[];
  }>;
  validationRows: ExportRow[];
  validationIssues: string[];
  fixSuggestions: string[];
  assumptions: string[];
};

function sanitizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "generated-artifacts";
}

function joinItems(items: string[]) {
  return items.map(sanitizeText).filter(Boolean).join("; ");
}

export function buildExportDocument(result: GenerationResult): ExportDocumentData {
  const productName = sanitizeText(result.analysis.productName || "Generated Product Concept");
  const generatedOn = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return {
    title: "AI-Generated Product Requirement Package",
    subtitle: productName,
    fileBaseName: slugify(productName),
    generatedOn,
    executiveSummary: sanitizeText(result.analysis.summary),
    metadataRows: [
      { label: "Product Name", value: productName },
      { label: "Primary Users", value: joinItems(result.analysis.actors) || "Not explicitly specified" },
      { label: "Primary Objective", value: result.prd.goals[0] || "Not explicitly specified" },
      { label: "Delivery Scope", value: joinItems(result.prd.features.map((feature) => feature.name)) || "Not explicitly specified" },
      { label: "Consistency Score", value: String(result.validation.consistencyScore) },
      { label: "Generated On", value: generatedOn },
    ],
    overviewRows: [
      { label: "Product Overview", value: sanitizeText(result.prd.productOverview) },
      { label: "Problem Statement", value: sanitizeText(result.prd.problemStatement) },
      { label: "Non-Functional Requirements", value: joinItems(result.prd.nonFunctionalRequirements) || "None listed" },
      { label: "Success Metrics", value: joinItems(result.prd.successMetrics) || "None listed" },
    ],
    goals: result.prd.goals,
    personas: {
      title: "User Personas",
      headers: ["Persona", "Role", "Needs", "Pain Points"],
      rows: result.prd.userPersonas.map((persona) => [
        persona.name,
        persona.role,
        joinItems(persona.needs),
        joinItems(persona.painPoints),
      ]),
    },
    userJourney: {
      title: "User Journey",
      headers: ["Step", "Description"],
      rows: result.prd.userJourney.map((item) => [item.step, item.description]),
    },
    features: {
      title: "Features",
      headers: ["Feature", "Description"],
      rows: result.prd.features.map((feature) => [feature.name, feature.description]),
    },
    userStories: {
      title: "User Stories",
      headers: ["ID", "Role", "Action", "Benefit", "Story"],
      rows: result.userStories.map((story) => [story.id, story.role, story.action, story.benefit, story.story]),
    },
    functionalRequirements: {
      title: "Functional Requirements",
      headers: ["ID", "Title", "Description", "Priority", "Related Stories"],
      rows: result.functionalRequirements.map((requirement) => [
        requirement.id,
        requirement.title,
        requirement.description,
        requirement.priority,
        joinItems(requirement.relatedStories),
      ]),
    },
    sitemap: {
      title: "Sitemap",
      headers: ["Page / Node", "Purpose", "Children"],
      rows: result.uiUx.sitemap.map((node) => [node.name, node.purpose, joinItems(node.children)]),
    },
    screenList: {
      title: "Screen List",
      headers: ["Screen ID", "Screen Name", "Purpose", "Primary User", "Key Features"],
      rows: result.uiUx.screenList.map((screen) => [
        screen.id,
        screen.name,
        screen.purpose,
        screen.primaryUser,
        joinItems(screen.keyFeatures),
      ]),
    },
    userFlow: {
      title: "User Flow",
      headers: ["Step", "Screen", "User Action", "System Response"],
      rows: result.uiUx.userFlow.map((step) => [
        String(step.step),
        step.screen,
        step.userAction,
        step.systemResponse,
      ]),
    },
    wireframeSummaries: result.uiUx.wireframes.map((wireframe) => ({
      title: wireframe.screenName,
      rows: [
        { label: "Screen ID", value: wireframe.screenId },
        { label: "Goal", value: wireframe.goal },
        { label: "Layout", value: wireframe.layout },
        { label: "Primary Action", value: wireframe.primaryAction },
      ],
      sections: wireframe.sections.map((section) => `${section.name}: ${joinItems(section.components)}`),
      notes: wireframe.notes,
    })),
    validationRows: [
      { label: "Consistency Score", value: String(result.validation.consistencyScore) },
      { label: "Issue Count", value: String(result.validation.issues.length) },
      { label: "Suggestion Count", value: String(result.validation.fixSuggestions.length) },
    ],
    validationIssues: result.validation.issues,
    fixSuggestions: result.validation.fixSuggestions,
    assumptions: result.analysis.assumptions,
  };
}
