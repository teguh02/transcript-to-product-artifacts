const JSON_ONLY_RULE = [
  "Return strict JSON only.",
  "Do not wrap the response in markdown code fences.",
  "Do not invent facts that are not supported by the transcript.",
  "If you infer something, place it under assumptions or make the wording clearly conditional.",
  "Avoid generic startup filler.",
].join(" ");

export function buildOneShotArtifactsPrompt(transcript: string) {
  return `You are a senior product manager and product designer. Read the meeting transcript and generate a complete product artifact package in English. ${JSON_ONLY_RULE}

This is a quick prototype request that must complete fast and reliably.
Keep the output concise, grounded, and internally consistent.
Prefer short, high-quality items over long lists.
Keep paragraph fields to 1 short paragraph each.
Use compact phrasing and avoid repeating the same idea.
Do not exceed these limits:
- actors: 3
- problems: 3
- goals: 3
- featureIdeas: 3
- constraints: 3
- nonFunctionalSignals: 3
- successSignals: 3
- assumptions: 3
- openQuestions: 2
- userPersonas: 2
- userJourney steps: 3
- features: 3
- prd functionalRequirements summary items: 3
- nonFunctionalRequirements: 3
- successMetrics: 3
- userStories: 3
- functionalRequirements: 4
- sitemap nodes: 4
- screenList screens: 3
- userFlow steps: 4
- wireframes: 2
- wireframe sections per screen: 2
- wireframe components per section: 2
- wireframe notes per screen: 2
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
