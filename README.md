# IdeaForge

Creative tool: 5-step behavioral questionnaire → hosted AI → 3-5 structured software-idea suggestions (labeled AI-generated), with per-idea refine, feedback, and regenerate. Ideas only — no tech stack, no code.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000.

Requires Node 20.9+ (App Router, Next.js 16).

## Environment

| Var | Required | Default | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | yes (to call AI) | — | Server-only, never in the browser |
| `OPENAI_MODEL` | no | `gpt-4o-mini` | Any OpenAI-compatible model name |
| `OPENAI_BASE_URL` | no | `https://api.openai.com/v1` | Point at any compatible provider |

## API (server holds the key)

- `POST /api/ideas` — `{ answers, mode?: "generate"\|"regenerate", excludeIds?: [] }` → `{ ideas: Idea[] }`
- `POST /api/refine` — `{ answers, idea }` → `{ idea: Idea & { next_steps[], gap } }`

Errors: `{ error }` with codes `validation_error | model_error | generation_error | rate_limit | config_missing`.

## Architecture

- Server page (`app/page.tsx`) renders the app; AI calls live solely in route handlers under `app/api`.
- Wizard + results are client components (`components/idea-wizard.tsx`, `components/results-view.tsx`, `components/idea-card.tsx`).
- Prompts + Zod schemas: `lib/ai.ts`, `lib/schema.ts`. Design tokens: `app/globals.css` (teal/orange flat system).
- Product docs: `docs/` (OKF bundle) + `PROJECT.md` (PM artifact).

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel (framework preset auto-detects Next.js).
3. Add env vars from the table above (set `OPENAI_API_KEY` in Project Settings → Environment Variables).
4. Deploy. Serverless functions `app/api/*` run server-side and keep the key private.

## Design notes

- Behavioral-first questions (daily frictions, know-how, who you help, goal) — demographics are optional, weak signals.
- Every idea card is labeled AI-generated and carries a validation path + honest "similar tools may exist" flag.
- Ideas are schema-validated server-side (Zod) and filtered against a banned stack-word list before render.