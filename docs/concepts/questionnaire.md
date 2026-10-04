---
type: Questionnaire
title: IdeaForge 5-Step Behavioral Wizard
description: Behavior-first question set that elicits creative constraints from the user's life
tags: [elicitation, wizard]
status: draft
---

# Questionnaire

Behavioral questions first; demographics optional. Rationale (A1): demographic signals (age/lifestyle) are weak predictors of useful software ideas; constraints come from the user's actual daily frictions, know-how, and goals. Blank canvas → generic listicles; behavioral context → unique ideas.

## Wizard structure (5 steps, ≤3 min)

Progress bar + "Step X of 5". Every step: clear prompt, textarea (min chars enforced where required), skip button where optional. Back allowed. All fields optional at submit except step 1's first prompt (min 1 answer) to guarantee signal.

| Step | Prompt | Control | Required |
|---|---|---|---|
| 1 · Frictions | "What repetitive, manual, or annoying tasks eat your time regularly?" | Textarea, min 30 chars | yes |
| 1 · Wishes | "What do you wish existed but doesn't?" | Textarea | optional |
| 2 · Know-how | "What domains, hobbies, or jobs do you know deeply?" | Textarea | optional |
| 2 · Skill | "How comfortable are you building software yourself?" | Radio: can't build / no-code tools / beginner coder / confident coder | optional (default: no-code) |
| 3 · People | "Who would you love to help with a tool — and with what?" | Textarea | optional |
| 4 · Goal | "What is this project really for?" | Radio: side income / learn to build / save my own time / solve my own problem / just fun | optional (default: side income) |
| 5 · Context | "Anything else? Age range (optional), where you live, constraints, time budget." | Textarea + age select (optional) | optional |

## Submit payload (POST /api/ideas)

```json
{
  "answers": {
    "frictions": "…",
    "wishes": "…",
    "knowhow": "…",
    "skill": "confident-coder",
    "people": "…",
    "goal": "side-income",
    "context": "…",
    "age": "25-34"
  }
}
```

## DoD
Owner-approved wording; dry-run completion ≤3 min; every control has visible label + autofocus in step; error summary on submit with inline messages.