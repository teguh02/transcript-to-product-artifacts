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

Server safety behavior:

- Generate route normalizes and caps transcript length before sending to the model to keep generation stable.
- OpenAI model selection, timeout, and token limits are hardened server-side with built-in fallbacks for reliability.

## Netlify Deployment

This project includes a `netlify.toml` file for Next.js deployment.

### Environment Variables in Netlify

Add these exact variable names in `Site configuration` -> `Environment variables`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Important:

- use the exact names above
- do not rename the key to `NEXT_PUBLIC_*`
- these variables are used by server routes, not client-side code
- model and request limits are already optimized in server code

### Recommended Netlify Setup

1. Import the GitHub repository into Netlify
2. Let Netlify detect `Next.js`
3. Confirm the build command is `npm run build`
4. Use `Node 20` for the build environment
5. Add the required environment variables
6. Deploy the site

### Notes

- The app uses Next.js server routes for `/api/generate` and `/api/transcribe`
- A successful deployment requires server-side support, not static export only
- The included `netlify.toml` pins the build to Node 20 LTS for better compatibility
- Netlify production is more reliable with a faster text model and a bounded OpenAI timeout
- If you update environment variables later, trigger a redeploy
