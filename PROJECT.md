# IdeaForge
Location: ~/Documents/projects/ideaforge
Goal: Creative tool that turns a user's behavioral context into 3-5 structured software-idea suggestions.
DoD: Fresh user completes 5-step wizard ≤3 min → sees 3-5 AI-labeled structured ideas (problem/audience/name/description/why-now/differentiator/validate-path), no tech-stack mentions → can like/refine/regenerate any idea.
Status: active

## Milestones
- [x] M0 Scaffold + design system — DoD: app boots, design tokens persisted, OKF bundle valid
- [x] M1 Questionnaire spec — DoD: 5-step behavioral wizard, field schema frozen
- [x] M2 LLM blueprint — DoD: prompt+output schema, fixture dry-run passes
- [x] M3 Spine — DoD: wizard → /api/ideas → idea cards end-to-end on dev machine
- [x] M4 Refine — DoD: per-card refine via /api/refine end-to-end
- [x] M5 Feedback + deploy — DoD: thumbs/favorite/regenerate + deploy README

## Dependency graph
M0 -> M1 -> M2 -> M3 -> M4 -> M5

## Assumption ledger
| # | Decision | Made at | Revisit when |
|---|----------|---------|--------------|
| A1 | Behavioral Qs > demographics | Kickoff | A/B shows demographics win |
| A2 | OpenAI-compatible key, env-configured | Kickoff | Provider change needed |
| A3 | Serverless deploy (Vercel) | Kickoff | Latency/cost exceed budget |
| A4 | Refine = one follow-up call, not chat | Kickoff | Multi-turn demand |
| A5 | No token streaming v1; skeleton stagger | UX review | Latency persistent pain |
| A6 | Feedback in localStorage, no backend | UX review | Want real analytics |

## Risk / blocker register
| ID | Risk | Impact | Likelihood | Mitigation | Status |
|----|------|--------|------------|------------|--------|
| R1 | Generic output, fails "wow" | High | Med | Behavioral wizard + schema discipline + fixture gate | open |
| R2 | AI slow/down | Med | Med | Skeleton cards, retry, cheap model fallback | open |
| R3 | Duplicate products surfaced w/o honesty | Med | Med | Prompt honesty clause + similar-exists note | open |
| R4 | Wizard churn | Med | Med | 5 short steps, skip, progress bar, ≤3min | open |

## Milestone gates
- M0–M5: build passes (`npm run build`), ESLint clean, prod `next start` smoke: home 200 + wizard renders, `/api/ideas` 400 on bad body, 500 config_missing without key, provider-failure path handled. Fixture dry-run gate pending real-key run (needs OPENAI_API_KEY).

## Next actions
- [ ] Owner review of questionnaire wording (M1 gate)
- [ ] Real-key fixture dry-run: POST sample answers → verify 3-5 ideas, schema-valid, zero banned stack words
- [ ] Decide: commit + push → Vercel deploy