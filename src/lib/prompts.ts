const JSON_ONLY_RULE = [
  "Return strict JSON only.",
  "Do not wrap the response in markdown code fences.",
  "Do not invent facts that are not supported by the transcript.",
  "If you infer something, place it under assumptions or make the wording clearly conditional.",
  "Avoid generic startup filler.",
].join(" ");

export function buildAnalysisPrompt(transcript: string) {
  return `You are an expert product analyst. Analyze the meeting transcript and extract grounded product information. ${JSON_ONLY_RULE}

Every array in the response must contain plain strings only. Do not return objects inside arrays like actors, problems, featureIdeas, constraints, nonFunctionalSignals, successSignals, assumptions, or openQuestions.

Return this JSON shape:
{
  "productName": "",
  "summary": "",
  "actors": [],
  "problems": [],
  "goals": [],
  "featureIdeas": [],
  "constraints": [],
  "nonFunctionalSignals": [],
  "successSignals": [],
  "assumptions": [],
  "openQuestions": []
}

Transcript:
${transcript}`;
}

export function buildProductArtifactsPrompt(analysis: string) {
  return `You are a senior product manager. Based on the transcript analysis below, generate product artifacts in English. ${JSON_ONLY_RULE}

Return this JSON shape:
{
  "prd": {
    "productOverview": "",
    "problemStatement": "",
    "goals": [],
    "userPersonas": [
      {
        "name": "",
        "role": "",
        "needs": [],
        "painPoints": []
      }
    ],
    "userJourney": [
      {
        "step": "",
        "description": ""
      }
    ],
    "features": [
      {
        "name": "",
        "description": ""
      }
    ],
    "functionalRequirements": [],
    "nonFunctionalRequirements": [],
    "successMetrics": []
  },
  "userStories": [
    {
      "id": "US-001",
      "role": "",
      "action": "",
      "benefit": "",
      "story": "As a [user], I want [action] so that [benefit]."
    }
  ],
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "",
      "description": "",
      "priority": "High",
      "relatedStories": ["US-001"]
    }
  ]
}

Transcript analysis:
${analysis}`;
}

export function buildFullArtifactsPrompt(analysis: string) {
  return `You are a senior product manager and product designer. Based on the transcript analysis below, generate a complete product artifact package in English. ${JSON_ONLY_RULE}

Every array field that represents text items must contain plain strings only unless the schema below explicitly requires objects.

Return this JSON shape:
{
  "prd": {
    "productOverview": "",
    "problemStatement": "",
    "goals": [],
    "userPersonas": [
      {
        "name": "",
        "role": "",
        "needs": [],
        "painPoints": []
      }
    ],
    "userJourney": [
      {
        "step": "",
        "description": ""
      }
    ],
    "features": [
      {
        "name": "",
        "description": ""
      }
    ],
    "functionalRequirements": [],
    "nonFunctionalRequirements": [],
    "successMetrics": []
  },
  "userStories": [
    {
      "id": "US-001",
      "role": "",
      "action": "",
      "benefit": "",
      "story": "As a [user], I want [action] so that [benefit]."
    }
  ],
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "",
      "description": "",
      "priority": "High",
      "relatedStories": ["US-001"]
    }
  ],
  "uiUx": {
    "sitemap": [
      {
        "name": "",
        "purpose": "",
        "children": []
      }
    ],
    "screenList": [
      {
        "id": "SCR-001",
        "name": "",
        "purpose": "",
        "primaryUser": "",
        "keyFeatures": []
      }
    ],
    "userFlow": [
      {
        "step": 1,
        "screen": "",
        "userAction": "",
        "systemResponse": ""
      }
    ],
    "wireframes": [
      {
        "screenId": "SCR-001",
        "screenName": "",
        "goal": "",
        "layout": "",
        "primaryAction": "",
        "sections": [
          {
            "name": "",
            "components": []
          }
        ],
        "notes": []
      }
    ]
  },
  "validation": {
    "consistencyScore": 0,
    "issues": [],
    "fixSuggestions": []
  }
}

Artifacts must be internally consistent.
Validation issues and suggestions should be concise and useful.

Transcript analysis:
${analysis}`;
}

export function buildUiUxPrompt(context: string) {
  return `You are a product designer creating low-fidelity UX artifacts. Generate practical and traceable UI/UX outputs based on the context below. ${JSON_ONLY_RULE}

Return this JSON shape:
{
  "sitemap": [
    {
      "name": "",
      "purpose": "",
      "children": []
    }
  ],
  "screenList": [
    {
      "id": "SCR-001",
      "name": "",
      "purpose": "",
      "primaryUser": "",
      "keyFeatures": []
    }
  ],
  "userFlow": [
    {
      "step": 1,
      "screen": "",
      "userAction": "",
      "systemResponse": ""
    }
  ],
  "wireframes": [
    {
      "screenId": "SCR-001",
      "screenName": "",
      "goal": "",
      "layout": "",
      "primaryAction": "",
      "sections": [
        {
          "name": "",
          "components": []
        }
      ],
      "notes": []
    }
  ]
}

Context:
${context}`;
}

export function buildValidationPrompt(context: string) {
  return `You are reviewing generated product artifacts for internal consistency. Check whether the goals, features, user stories, functional requirements, and screens support each other. ${JSON_ONLY_RULE}

Return this JSON shape:
{
  "consistencyScore": 0,
  "issues": [],
  "fixSuggestions": []
}

Artifacts:
${context}`;
}
