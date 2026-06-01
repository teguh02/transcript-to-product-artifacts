# AI Product Requirement & UI Generator

Generate a PRD, user stories, functional requirements, sitemap, user flow, and structured low-fidelity wireframes from a meeting transcript.

The transcript can come from pasted text, a `.txt` file, or an uploaded audio file transcribed with OpenAI speech-to-text.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI API
- Zod
- html-to-image

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env.local
```

3. Open `.env.local` and set your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.4
OPENAI_TRANSCRIPTION_MODEL=whisper-1
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Notes

- The app uses a staged AI pipeline:
  - transcript analysis
  - product artifact generation
  - UI/UX generation
  - validation pass
- Wireframes are generated as structured low-fidelity layouts, then rendered in the frontend.
- Each rendered wireframe can be downloaded as a PNG image.
- Audio uploads are transcribed first, then inserted into the main transcript editor for review before generation.

## Required Environment Variables

- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional, defaults to `gpt-5.4`
- `OPENAI_TRANSCRIPTION_MODEL` optional, defaults to `whisper-1`
