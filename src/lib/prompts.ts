const JSON_ONLY_RULE = [
  "Return strict JSON only.",
  "Do not wrap the response in markdown code fences.",
  "Do not invent facts that are not supported by the transcript.",
  "If you infer something, place it under assumptions or make the wording clearly conditional.",
  "Avoid generic startup filler.",
].join(" ");

export function buildOneShotArtifactsPrompt(transcript: string) {
  return `You are a senior product manager and product designer. Read the meeting transcript and generate a complete product artifact package in English. ${JSON_ONLY_RULE}

This is a production request that must complete quickly and reliably.
Keep the output concise, grounded, and internally consistent.
Every array field that represents text items must contain plain strings only unless the schema below explicitly requires objects.
Do not include a validation object in the response.

Return this JSON shape:
{
  "analysis": {
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
  },
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
  }
}

Transcript:
${transcript}`;
}
