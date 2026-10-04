import {
  ideaRefinedSchema,
  ideasResponseSchema,
  type Answers,
  type GenerateMode,
  type Idea,
  type IdeaRefined,
} from "./schema";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const BANNED = [
  "react", "next.js", "nextjs", "python", "javascript", "typescript",
  "tailwind", "database", "server", "backend", "frontend", "hosting",
  "vercel", "aws", "docker", "api", "sdk", "framework", "stack",
  "app-store", "ios", "android", "chrome-extension", "mobile-app",
];

const GENERATE_SYSTEM = `You are IdeaForge, an idea generator for software products.

Rules:
- You propose WHAT to build, never HOW. Never mention any tech stack, platform, framework, programming language, hosting, or "build an app with X". Software solutions are described in plain human terms only.
- Ground every idea in the user's stated context: their frictions, wishes, know-how, who they want to help, and their goal. Never output a generic listicle idea (to-do app, habit tracker, generic chatbot, generic AI assistant).
- Prefer niche, personal, or adjacent-to-know-how ideas over obvious ones. At most one universally obvious idea per response.
- Be honest: when you are aware of overlapping existing products, set similar_exists=true. The UI will show "similar tools may exist".
- Response MUST be valid JSON exactly matching this shape, with 3 to 5 ideas, nothing else:
{"ideas":[{"id":"lowercase-kebab-slug","name":"Short concrete name","problem":"The user's pain, in their own context","audience":"Exactly who benefits","description":"The software in 2-3 plain sentences, no stack","why_now":"Why now / why this user can pull it off now","differentiator":"What makes it unlike common options","validate_path":"Cheapest non-code way to check demand","similar_exists":true|false}]}
No prose, no markdown fences.`;

const REFINE_SYSTEM = `You are IdeaForge. The user picked one idea and wants it developed deeper before deciding to build it.

Rules:
- Keep the same fields and values: name, problem, audience, description, why_now, differentiator, validate_path, similar_exists.
- Extend with next_steps (3-6 ordered, concrete, NON-code actions to validate or launch the idea) and gap (the single biggest open question to prove first).
- Still no tech stack, platform, or "build with X" specifics.
- Response MUST be valid JSON only, exactly matching this shape:
{"idea":{"id":"...","name":"...","problem":"...","audience":"...","description":"...","why_now":"...","differentiator":"...","validate_path":"...","similar_exists":true,"next_steps":["...", "...", "..."],"gap":"..."}}
No prose, no markdown fences.`;

const bannedRegex = new RegExp(`\\b(${BANNED.join("|")})\\b`, "i");

function bannedWordsHit(idea: Idea): string | null {
  for (const field of ["name", "problem", "description", "differentiator", "why_now", "audience"] as const) {
    const m = idea[field].match(bannedRegex);
    if (m) return `${field}: ${m[0]}`;
  }
  return null;
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Response contained no JSON object.");
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function chat(system: string, user: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new SyncError("config_missing", "OPENAI_API_KEY is not set on the server.");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 1.0,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (res.status === 429) {
      throw new SyncError("rate_limit", "The model provider is rate-limiting us. Wait a moment and retry.");
    }
    if (!res.ok) {
      await res.text().catch(() => "");
      throw new SyncError("model_error", `Model provider returned ${res.status}.`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) {
      throw new SyncError("generation_error", "The model returned an empty response. Retry.");
    }
    return content;
  } finally {
    clearTimeout(timer);
  }
}

export class SyncError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "SyncError";
    this.code = code;
  }
}

export async function generateIdeas(answers: Answers, mode: GenerateMode, excludeIds: string[]): Promise<Idea[]> {
  const user = JSON.stringify({ answers, mode, excludeIds });
  const content = await chat(GENERATE_SYSTEM, user);
  const parsed = ideasResponseSchema.safeParse(extractJson(content));
  if (!parsed.success) {
    throw new SyncError("generation_error", "The model returned ideas that did not match the required schema. Retry.");
  }
  const kept = parsed.data.ideas.filter((idea) => bannedWordsHit(idea) === null);
  if (kept.length < 3) {
    throw new SyncError("generation_error", "The model drifted from the idea-only rule. Retry.");
  }
  return kept;
}

export async function refineIdea(answers: Answers, idea: Idea): Promise<IdeaRefined> {
  const user = JSON.stringify({ answers, idea });
  const content = await chat(REFINE_SYSTEM, user);
  const json = extractJson(content) as { idea?: unknown };
  const parsed = ideaRefinedSchema.safeParse(json?.idea);
  if (!parsed.success) {
    throw new SyncError("generation_error", "The model returned a refined idea that did not match the schema. Retry.");
  }
  return parsed.data;
}