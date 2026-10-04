---
type: Design System
title: IdeaForge Visual Design System
description: Design tokens adopted from ui-ux-pro-max design system (teal/orange flat system)
resource: ../design-system/ideaforge/MASTER.md
tags: [design, tokens]
status: draft
---

# Design System

Source of truth: `../design-system/ideaforge/MASTER.md` (persisted UI Pro Max output). This concept records the adopted decisions.

## Tokens

| Token | Value | Notes |
|---|---|---|
| primary | `#0D9488` (teal) | on-primary `#000000` |
| secondary | `#14B8A6` | on-secondary `#0F172A` |
| accent/CTA | `#EA580C` (orange) | on-accent `#000000` |
| accent-strong | `#C2410C` (dark) / `#FDBA74` (light) | orange for text on white/orange-on-dark: readable ≥4.5:1; `text-accent-strong` in code |
| spark | `#7C3AED` (dark) / `#C4B5FD` (light) | violet, reserved for AI/idea moments: Generate CTA, AI badge, Sparkles, active step node (`--color-spark`) |
| background | `#F0FDFA` | foreground `#134E4A` |
| card | `#FFFFFF` | card-foreground `#134E4A` |
| muted | `#E8F1F4` | muted-foreground `#475569` |
| border | `#99F6E4` | |
| destructive | `#DC2626` | on-destructive `#FFFFFF` |
| ring | `#0D9488` | focus |

## Type
Space Grotesk (headings, `--font-heading`) + Inter (body/sans) weights 300–700. Clean technical, with a measured creative edge (geometric display). Google Fonts.

## Effects
Flat: no gradients/shadows. Hover = color/opacity shift. Transitions 150-200ms ease. Minimal icons (Lucide).

## Anti-patterns
Complex onboarding; slow performance; emojis as structural icons; placeholder-only labels.