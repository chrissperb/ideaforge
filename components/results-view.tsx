"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IdeaCard } from "./idea-card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { Answers, Idea, IdeaRefined } from "@/lib/schema";
import { randomGeneratingPhrase } from "@/lib/phrases";
import { cn } from "@/lib/utils";

type Thumbs = "up" | "down" | null;

interface Feedback {
  [ideaId: string]: { thumbs: Thumbs; fav: boolean };
}

const FEEDBACK_KEY = "ideaforge-feedback";

function readFeedback(): Feedback {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) ?? "{}") as Feedback;
  } catch {
    return {};
  }
}

function apiError(body: { error?: string; message?: string }): string {
  switch (body.error) {
    case "rate_limit":
      return body.message ?? "Sparks are flying too fast — wait a moment, then retry.";
    case "model_error":
      return body.message ?? "The idea engine hiccuped. Retry once.";
    case "generation_error":
    case "validation_error":
      return body.message ?? "Couldn't forge valid ideas this time. Retry.";
    case "config_missing":
      return body.message ?? "Server not configured for AI calls yet.";
    default:
      return "Something short-circuited on our side. Retry.";
  }
}

interface Props {
  answers: Answers;
  onReset: () => void;
}

export function ResultsView({ answers, onReset }: Props) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [refined, setRefined] = useState<Record<string, IdeaRefined>>({});
  const [loading, setLoading] = useState(true);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Feedback>(readFeedback);
  const [loadingPhrase, setLoadingPhrase] = useState<string | null>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const updateFeedback = (updater: (prev: Feedback) => Feedback) => {
    setFeedback((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — keep in-memory only
      }
      return next;
    });
  };

  const load = useCallback(async (excludeIds: string[]) => {
    setLoading(true);
    setLoadingPhrase(randomGeneratingPhrase());
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, mode: "generate", excludeIds }),
      });
      const body = (await res.json()) as { ideas?: Idea[]; error?: string; message?: string };
      if (!res.ok || !body.ideas) {
        setError(apiError(body));
        return;
      }
      setIdeas(body.ideas);
    } catch {
      setError("Network hiccup reaching the forge. Retry.");
    } finally {
      setLoading(false);
    }
  }, [answers]);

  useEffect(() => {
    const t = setTimeout(() => void load([]), 0);
    return () => clearTimeout(t);
  }, [load]);

  const refine = async (idea: Idea) => {
    setRefiningId(idea.id);
    setError(null);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, idea }),
      });
      const body = (await res.json()) as { idea?: IdeaRefined; error?: string; message?: string };
      if (!res.ok || !body.idea) {
        setError(apiError(body));
        return;
      }
      setRefined((prev) => ({ ...prev, [idea.id]: body.idea! }));
      setExploded((prev) => ({ ...prev, [idea.id]: true }));
    } catch {
      setError("Network hiccup while refining. Retry.");
    } finally {
      setRefiningId(null);
    }
  };

  const regenerate = async () => {
    setLoading(true);
    setLoadingPhrase(randomGeneratingPhrase());
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, mode: "regenerate", excludeIds: ideas.map((i) => i.id) }),
      });
      const body = (await res.json()) as { ideas?: Idea[]; error?: string; message?: string };
      if (!res.ok || !body.ideas) {
        setError(apiError(body));
        return;
      }
      setIdeas(body.ideas);
      setRefined({});
      setExploded({});
    } catch {
      setError("Network hiccup while regenerating. Retry.");
    } finally {
      setLoading(false);
    }
  };

  const setThumbs = (id: string, value: Thumbs) =>
    updateFeedback((f) => ({ ...f, [id]: { thumbs: value, fav: f[id]?.fav ?? false } }));
  const setFav = (id: string) =>
    updateFeedback((f) => ({ ...f, [id]: { thumbs: f[id]?.thumbs ?? null, fav: !(f[id]?.fav ?? false) } }));

  const handleAction = (idea: Idea) => {
    if (refined[idea.id]) {
      setExploded((prev) => ({ ...prev, [idea.id]: !(prev[idea.id] ?? false) }));
    } else {
      void refine(idea);
    }
  };

  return (
    <section className="w-full" aria-live="polite">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">Your ideas</h2>
          <p className="text-sm text-muted-foreground">Generated from your answers · labeled AI · ideas only, no stack</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} aria-label="Start over">
            <ArrowLeft className="size-4" aria-hidden="true" /> Start over
          </Button>
          <Button variant="outline" size="sm" onClick={regenerate} disabled={loading} aria-busy={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden="true" />
            Regenerate
          </Button>
        </div>
      </div>

      {error && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-foreground outline-none focus-visible:outline-2 focus-visible:outline-ring"
        >
          <p>{error}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => (ideas.length ? void regenerate() : void load([]))}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4" aria-busy="true" role="status">
          <p className="text-sm text-muted-foreground">
            <span className="sr-only">Generating your ideas. </span>
            {loadingPhrase ?? "Forging your ideas…"}
          </p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border bg-card p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : !ideas.length ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No ideas forged yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              refined={refined[idea.id] ?? null}
              refining={refiningId === idea.id}
              expanded={exploded[idea.id] ?? false}
              thumbs={feedback[idea.id]?.thumbs ?? null}
              fav={feedback[idea.id]?.fav ?? false}
              onThumbs={(v) => setThumbs(idea.id, v)}
              onFav={() => setFav(idea.id)}
              onAction={() => handleAction(idea)}
            />
          ))}
        </div>
      )}
    </section>
  );
}