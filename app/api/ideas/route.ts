import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { generateIdeas, SyncError } from "@/lib/ai";
import { generateRequestSchema } from "@/lib/schema";

export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }
  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error instanceof ZodError
      ? parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
      : [];
    return NextResponse.json({ error: "validation_error", issues }, { status: 400 });
  }
  const { answers, mode, excludeIds } = parsed.data;
  try {
    const ideas = await generateIdeas(answers, mode, excludeIds);
    return NextResponse.json({ ideas });
  } catch (err) {
    if (err instanceof SyncError) {
      const status = err.code === "rate_limit" ? 429 : err.code === "config_missing" ? 500 : 502;
      return NextResponse.json({ error: err.code, message: err.message }, { status });
    }
    console.error("[ideas] unexpected", err);
    return NextResponse.json({ error: "generation_error", message: "Unexpected server error." }, { status: 500 });
  }
}