# AI Product Requirement & UI Generator - Implementation Plan

## Current Context

This repository currently contains only the coding test requirement in `requirement.md`.

The agreed implementation direction is:

- Stack: `Next.js + TypeScript + Tailwind CSS + OpenAI API`
- Main wireframe strategy: `structured low-fidelity layout`, not AI image-first
- Additional feature: allow wireframes rendered in the frontend to be downloaded as images
- Primary delivery goal: a strong MVP optimized for a `5 hour` coding test

## Requirement Summary

The application must convert a meeting transcript into:

1. Product Requirements Document (PRD)
2. User Stories
3. Functional Requirements
4. UI/UX Design

### Input

- Transcript pasted as text
- Transcript uploaded as file

### Required Output Details

#### PRD Structure

- Product Overview
- Problem Statement
- Goals
- User Personas
- User Journey
- Features
- Functional Requirements
- Non-Functional Requirements
- Success Metrics

#### User Stories

Format:

`As a [user], I want [action] so that [benefit].`

#### Functional Requirements

- Structured requirement list
- IDs like `FR-001`, `FR-002`, and so on

#### UI/UX Design

- Sitemap
- Screen List
- Low-fidelity Wireframes
- User Flow

## Evaluation Criteria Interpretation

The coding test weights imply the following priorities:

1. `AI Extraction Accuracy - 35%`
2. `Product Thinking - 20%`
3. `UI/UX Generation - 20%`
4. `Code Quality - 15%`
5. `UX & Presentation - 10%`

This means the solution should prioritize:

- accuracy over feature breadth
- structured and traceable outputs
- practical UI/UX artifacts grounded in the transcript
- a polished demo flow

## Product Strategy

This application should be built as a focused artifact generator, not a broad multi-tool AI platform.

Core product goals:

1. Accept transcript input quickly
2. Generate all required artifacts in a consistent structure
3. Render outputs clearly and professionally
4. Show low-fidelity wireframes visually
5. Support wireframe image download from the frontend

## Main Engineering Decisions

### 1. No image model for the primary wireframe flow

Wireframes will be generated as structured UI specifications by an LLM and rendered visually in the frontend.

Reasons:

1. Better consistency with transcript-derived requirements
2. Better product thinking signal for the interviewer
3. Faster implementation within the time limit
4. Easier to validate and iterate
5. Easier to export as images from rendered DOM

### 2. Wireframe images are generated from the frontend renderer

Wireframes will be displayed as low-fidelity screen blocks and exported to PNG using a frontend library such as:

- `html-to-image`

This keeps the wireframe source of truth as structured data rather than generated images.

### 3. No database for MVP

Database and persistence are optional according to the requirement. To protect delivery quality and speed, the MVP should avoid database setup.

### 4. Use a staged AI pipeline

The system should not attempt to generate everything in one prompt. A staged pipeline is more reliable and easier to validate.

## Agreed Output Language

The agreed default output language is:

- `English`

Reason:

- PRD, user stories, and functional requirements are typically stronger and more interview-friendly in English.

## Agreed Download Scope

For MVP:

- `Download PNG per wireframe screen`

Potential later extension:

- download all wireframes in one action

## Recommended Application Architecture

### Frontend

- `Next.js App Router`
- `TypeScript`
- `Tailwind CSS`

### Backend

- `Next.js API Route`
- `OpenAI API`

### Validation

- `Zod` for response schemas

## AI Model Plan

### Primary Model

- `gpt-5.4`

Use for:

1. transcript analysis
2. PRD generation
3. user stories generation
4. functional requirements generation
5. UI/UX artifact generation
6. validation pass

### Optional Secondary Model

- smaller OpenAI model if later needed for cheap retries or lightweight formatting

### Image Model

- not required for MVP
- not part of the primary implementation plan

## AI Pipeline Design

### Stage 1. Transcript Analysis

Purpose:

1. extract grounded product information
2. separate facts from assumptions
3. identify actors, problems, goals, features, constraints, and success indicators

Expected output shape:

```json
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
```

### Stage 2. Product Artifact Generation

Purpose:

Generate:

1. PRD
2. User Stories
3. Functional Requirements

These outputs must remain grounded in the transcript analysis.

### Stage 3. UX Artifact Generation

Purpose:

Generate:

1. sitemap
2. screen list
3. user flow
4. wireframe specification

These outputs should be traceable to features and functional requirements.

### Stage 4. Validation Pass

Purpose:

1. check internal consistency
2. detect missing links between goals, stories, requirements, and screens
3. surface assumptions or gaps

Expected output shape:

```json
{
  "consistencyScore": 0,
  "issues": [],
  "fixSuggestions": []
}
```

## Unified Output Contract

The backend should ideally return one structured response object for the frontend:

```json
{
  "input": {
    "transcript": ""
  },
  "analysis": {},
  "prd": {},
  "userStories": [],
  "functionalRequirements": [],
  "uiUx": {
    "sitemap": [],
    "screenList": [],
    "userFlow": [],
    "wireframes": []
  },
  "validation": {
    "consistencyScore": 0,
    "issues": [],
    "fixSuggestions": []
  }
}
```

Benefits:

1. simple frontend state management
2. easier schema validation
3. easier export and debugging
4. easier future persistence if needed

## Detailed Artifact Shapes

### PRD

```json
{
  "productOverview": "",
  "problemStatement": "",
  "goals": [],
  "userPersonas": [],
  "userJourney": [],
  "features": [],
  "functionalRequirements": [],
  "nonFunctionalRequirements": [],
  "successMetrics": []
}
```

### User Stories

```json
{
  "userStories": [
    {
      "id": "US-001",
      "role": "",
      "action": "",
      "benefit": "",
      "story": "As a [user], I want [action] so that [benefit]."
    }
  ]
}
```

### Functional Requirements

```json
{
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
```

### Wireframe Specification

```json
{
  "wireframes": [
    {
      "screenId": "SCR-001",
      "screenName": "Transcript Input",
      "goal": "Allow user to submit transcript and start generation",
      "layout": "two-column",
      "primaryAction": "Generate",
      "sections": [
        {
          "name": "Header",
          "components": ["logo", "title", "help"]
        },
        {
          "name": "Main",
          "components": ["textarea", "upload button", "sample button", "generate button"]
        }
      ],
      "notes": ["Show loading state during generation"]
    }
  ]
}
```

## UI and UX Plan

### Main Page

Main input area should include:

1. app title and description
2. transcript textarea
3. file upload for `.txt`
4. sample transcript action
5. generate button
6. loading and error states

### Results Workspace

Primary tabs:

1. `PRD`
2. `User Stories`
3. `Functional Requirements`
4. `UI/UX`

### UI/UX Tab

Should contain:

1. sitemap section
2. screen list section
3. user flow section
4. wireframe preview section
5. `Download PNG` action per screen

## Wireframe Rendering Plan

Each wireframe will be rendered as a visual low-fidelity card using:

1. labeled sections
2. bordered containers
3. component placeholders
4. simple layout groupings
5. stable white background for export quality

Each rendered wireframe card should have its own `ref` so it can be exported as an image.

## Prompting Strategy

All AI prompts should enforce these rules:

1. Use transcript-grounded information whenever possible
2. Do not invent facts without labeling them as assumptions
3. Return strict JSON matching the schema
4. Avoid generic filler language
5. Keep outputs consistent across artifacts
6. Ensure UI artifacts map back to goals and requirements

### Prompt Expectations by Stage

#### Transcript Analysis Prompt

Must instruct the model to:

1. identify core product signals
2. avoid hallucination
3. separate grounded facts and inferred assumptions

#### Product Artifact Prompt

Must instruct the model to:

1. generate a professional PRD
2. create user stories in the exact requested format
3. create non-overlapping functional requirements with IDs

#### UX Artifact Prompt

Must instruct the model to:

1. generate practical screens and flows
2. avoid decorative or speculative design ideas
3. produce renderable low-fidelity structure

#### Validation Prompt

Must instruct the model to:

1. review consistency
2. detect missing critical screens or requirements
3. surface fix suggestions in structured form

## Recommended File and Folder Structure

```text
src/
  app/
    page.tsx
    api/
      generate/
        route.ts
  components/
    transcript-input.tsx
    generation-progress.tsx
    result-tabs.tsx
    prd-view.tsx
    user-stories-view.tsx
    requirements-view.tsx
    sitemap-view.tsx
    screen-list-view.tsx
    user-flow-view.tsx
    wireframe-card.tsx
    wireframe-gallery.tsx
  lib/
    openai.ts
    prompts.ts
    schemas.ts
    mappers.ts
    export-image.ts
  types/
    artifacts.ts
  data/
    sample-transcript.ts
```

## File Responsibility Plan

### `src/app/page.tsx`

1. top-level page state
2. transcript input state
3. generate action
4. result rendering container

### `src/app/api/generate/route.ts`

1. accept transcript input
2. call AI pipeline stages
3. validate response shapes
4. return unified result

### `src/lib/openai.ts`

1. OpenAI client setup
2. helper wrappers for model calls

### `src/lib/prompts.ts`

1. transcript analysis prompt
2. product artifact prompt
3. UX artifact prompt
4. validation prompt

### `src/lib/schemas.ts`

1. all Zod schemas
2. parse utilities for AI responses

### `src/lib/export-image.ts`

1. export rendered wireframe DOM nodes to PNG

### `src/components/wireframe-card.tsx`

1. render one low-fidelity screen visually
2. provide export target node

## MVP Scope

The MVP should include:

1. transcript text input
2. `.txt` file upload
3. AI generation end-to-end
4. PRD tab
5. User Stories tab
6. Functional Requirements tab
7. UI/UX tab with sitemap, screen list, user flow, and wireframes
8. per-wireframe PNG download
9. loading, empty, and error states
10. sample transcript
11. README

## Stretch Scope

Only if time remains:

1. export JSON
2. export markdown
3. API specification draft
4. BPMN draft
5. download all wireframes

## Risk Register

### 1. AI output becomes too generic

Mitigation:

1. strong grounding prompts
2. staged pipeline
3. validation pass

### 2. AI output breaks schema

Mitigation:

1. Zod validation
2. one retry strategy if needed
3. clear failure UI

### 3. Wireframe export quality is poor

Mitigation:

1. stable layout dimensions
2. white export background
3. clear borders and typography
4. export per screen first

### 4. Transcript is ambiguous

Mitigation:

1. show assumptions
2. show open questions
3. preserve traceability to transcript

### 5. Time runs out

Mitigation:

1. skip database
2. skip image generation model
3. skip advanced export formats
4. focus on MVP completeness and polish

## 5-Hour Execution Plan

### Hour 1

1. initialize Next.js app
2. set up Tailwind CSS
3. build main page layout
4. implement transcript input and sample transcript
5. add result tab placeholders

### Hour 2

1. define TypeScript types
2. define Zod schemas
3. implement OpenAI client and generate route
4. implement transcript analysis stage

### Hour 3

1. implement PRD generation
2. implement user stories generation
3. implement functional requirements generation
4. render these outputs in UI

### Hour 4

1. implement sitemap generation
2. implement screen list generation
3. implement user flow generation
4. implement wireframe specification generation
5. render wireframe cards

### Hour 5

1. implement PNG export per wireframe
2. add loading and error states
3. add validation notes
4. finalize README
5. run final manual QA flow

## What Is Known Right Now

At this point, the confirmed knowledge is:

1. The repository only contains the requirement document
2. The target build should optimize for a short coding-test delivery window
3. The selected stack is `Next.js + TypeScript + Tailwind + OpenAI API`
4. The primary AI model should be `gpt-5.4`
5. The wireframe output should be structured low-fidelity layout data rendered in the frontend
6. Wireframe PNG download should happen from the frontend DOM renderer
7. The product output should be in English
8. The initial PNG export scope should be per screen
9. The implementation should focus on MVP quality before any bonus features

## Immediate Next Step After This Document

Build the application in this order:

1. bootstrap the Next.js project
2. create data contracts and schemas
3. implement the AI pipeline
4. render results
5. add wireframe PNG export
6. polish UX and README
