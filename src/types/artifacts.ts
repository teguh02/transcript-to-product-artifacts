export type Analysis = {
  productName: string;
  summary: string;
  actors: string[];
  problems: string[];
  goals: string[];
  featureIdeas: string[];
  constraints: string[];
  nonFunctionalSignals: string[];
  successSignals: string[];
  assumptions: string[];
  openQuestions: string[];
};

export type UserPersona = {
  name: string;
  role: string;
  needs: string[];
  painPoints: string[];
};

export type UserJourneyStep = {
  step: string;
  description: string;
};

export type FeatureItem = {
  name: string;
  description: string;
};

export type Prd = {
  productOverview: string;
  problemStatement: string;
  goals: string[];
  userPersonas: UserPersona[];
  userJourney: UserJourneyStep[];
  features: FeatureItem[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  successMetrics: string[];
};

export type UserStory = {
  id: string;
  role: string;
  action: string;
  benefit: string;
  story: string;
};

export type FunctionalRequirement = {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  relatedStories: string[];
};

export type SitemapNode = {
  name: string;
  purpose: string;
  children: string[];
};

export type ScreenItem = {
  id: string;
  name: string;
  purpose: string;
  primaryUser: string;
  keyFeatures: string[];
};

export type UserFlowStep = {
  step: number;
  screen: string;
  userAction: string;
  systemResponse: string;
};

export type WireframeSection = {
  name: string;
  components: string[];
};

export type Wireframe = {
  screenId: string;
  screenName: string;
  goal: string;
  layout: string;
  primaryAction: string;
  sections: WireframeSection[];
  notes: string[];
};

export type UiUx = {
  sitemap: SitemapNode[];
  screenList: ScreenItem[];
  userFlow: UserFlowStep[];
  wireframes: Wireframe[];
};

export type Validation = {
  consistencyScore: number;
  issues: string[];
  fixSuggestions: string[];
};

export type GenerationResult = {
  input: {
    transcript: string;
  };
  analysis: Analysis;
  prd: Prd;
  userStories: UserStory[];
  functionalRequirements: FunctionalRequirement[];
  uiUx: UiUx;
  validation: Validation;
};
