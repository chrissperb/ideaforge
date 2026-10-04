import { z } from "zod";

export const skillLevels = ["cant-build", "no-code", "beginner", "confident"] as const;
export const goals = ["side-income", "learn", "save-time", "own-problem", "fun"] as const;
export const ageRanges = ["under-18", "18-24", "25-34", "35-44", "45-54", "55-plus", "prefer-not"] as const;

export const answerSchema = z.object({
  frictions: z.string()
    .trim()
    .min(30, "Give a bit more detail — at least a couple of sentences."),
  wishes: z.string().trim().optional().default(""),
  knowhow: z.string().trim().optional().default(""),
  skill: z.enum(skillLevels).optional().default("no-code"),
  people: z.string().trim().optional().default(""),
  goal: z.enum(goals).optional().default("side-income"),
  context: z.string().trim().optional().default(""),
  age: z.enum(ageRanges).optional().default("prefer-not"),
});

export const ideaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  problem: z.string().min(1),
  audience: z.string().min(1),
  description: z.string().min(1),
  why_now: z.string().min(1),
  differentiator: z.string().min(1),
  validate_path: z.string().min(1),
  similar_exists: z.boolean(),
});

export const ideasResponseSchema = z.object({
  ideas: z.array(ideaSchema).min(3).max(5),
});

export const ideaRefinedSchema = ideaSchema.extend({
  next_steps: z.array(z.string()).min(1).max(8),
  gap: z.string().min(1),
});

export const generateRequestSchema = z.object({
  answers: answerSchema,
  mode: z.enum(["generate", "regenerate"]).optional().default("generate"),
  excludeIds: z.array(z.string()).optional().default([]),
});

export const refineRequestSchema = z.object({
  answers: answerSchema,
  idea: ideaSchema,
});

export type Answers = z.infer<typeof answerSchema>;
export type Idea = z.infer<typeof ideaSchema>;
export type IdeaRefined = z.infer<typeof ideaRefinedSchema>;
export type GenerateMode = z.infer<typeof generateRequestSchema>["mode"];