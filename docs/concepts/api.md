---
type: API
title: IdeaForge Route Contracts
description: API routes for idea generation and refinement
tags: [api, nextjs]
status: draft
---

# API

Next.js 16 App Router route handlers under `app/api`. Server = the only holder of the API key (env `OPENAI_API_KEY`). JSON in/out only.

## POST /api/ideas

Request:
```json
{ "answers": { "frictions": "…", "wishes": "…", "knowhow": "…",
  "skill": "…", "people": "…", "goal": "…", "context": "…", "age": "…" },
  "mode": "generate|regenerate", "excludeIds": ["id-a"] }
```
`ansselements.answers` validated (first prompt required ≥30 chars, others optional). AI call w/ prompt blueprint. Response:
```json
{ "ideas": [Idea…] }
```
Zod-validated; <3 valid → 502 `{ error: "generation_error" }`, client offers retry. Non-2xx from provider → 502 with `model_error`; create a `.env.local` example.

## POST /api/refine

Request: `{ "answers": Answer, "idea": Idea }`. Response: `{ "idea": IdeaRefined }` (schema + `next_steps[]`, `gap`).

## Errors (all routes)
`{ "error": "code" }` codes: `validation_error`, `model_error`, `generation_error`, `rate_limit`, `config_missing`. HTTP: 400/429/502/500.