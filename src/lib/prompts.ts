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
Prefer fewer, higher-quality items over long lists.
Keep paragraph fields to 1 short paragraph each.
Do not exceed these limits:
- actors: 4
- problems: 5
- goals: 5
- featureIdeas: 6
- constraints: 4
- nonFunctionalSignals: 4
- successSignals: 4
- assumptions: 3
- openQuestions: 3
- userPersonas: 3
- userJourney steps: 5
- features: 6
- prd functionalRequirements summary items: 6
- nonFunctionalRequirements: 4
- successMetrics: 4
- userStories: 6
- functionalRequirements: 8
- sitemap nodes: 6
- screenList screens: 6
- userFlow steps: 6
- wireframes: 4
- wireframe sections per screen: 4
- wireframe components per section: 4
- wireframe notes per screen: 3
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
