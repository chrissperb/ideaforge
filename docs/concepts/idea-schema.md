---
type: Schema
title: Idea Output Schema
description: Structured format an idea must satisfy before UI renders it
tags: [schema, llm-output]
status: draft
---

# Idea Schema

Generated response is a JSON object; strict config via Zod server-side before render. Violations → per-item drop, never render malformed cards.

## Field contract

| Field | Type | Required | Rule |
|---|---|---|---|
| `id` | string | yes | unique slug |
| `name` | string | yes | ≤6 words; concrete, not generic |
| `problem` | string | yes | the pain, grounded in user's stated context |
| `audience` | string | yes | who exactly; from user's stated people/context |
| `description` | string | yes | the software in 2-3 sentences; NO stack/tools |
| `why_now` | string | yes | why now / why user can do this now |
| `differentiator` | string | yes | what makes it unlike existing mush |
| `validate_path` | string | yes | cheapest way to check demand (no code required) |
| `similar_exists` | boolean | yes | honesty flag; true keeps note "similar tools may exist" |

## Shape

```json
{
  "ideas": [
    { "id": "…", "name": "…", "problem": "…", "audience": "…",
      "description": "…", "why_now": "…", "differentiator": "…",
      "validate_path": "…", "similar_exists": true }
  ]
}
```

## Cardinality
`ideas` array length 3-5. Fewer than 3 valid → route errors w/ retry.

## Refine output
Single `idea` object with same schema + extra `next_steps[]` (strings) + `gap` (what to check first).