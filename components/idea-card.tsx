"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, ThumbsUp, ThumbsDown, Star, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import type { Idea, IdeaRefined } from "@/lib/schema";
import { cn } from "@/lib/utils";

type Thumbs = "up" | "down" | null;

interface Props {
  idea: Idea;
  refined?: IdeaRefined | null;
  refining?: boolean;
  expanded: boolean;
  thumbs: Thumbs;
  fav: boolean;
  onAction: () => void;
  onThumbs: (value: Thumbs) => void;
  onFav: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground break-words">{label}</h4>
      <p className="text-sm leading-relaxed text-foreground break-words">{value}</p>
    </div>
  );
}

export function IdeaCard({ idea, refined, refining, expanded, thumbs, fav, onAction, onThumbs, onFav }: Props) {
  const showRefined = expanded && Boolean(refined);
  const activeRefined = refined ?? null;
  return (
    <article className="rounded-xl border bg-card p-5 transition-all hover:-translate-y-px hover:border-ring">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-spark" aria-hidden="true" />
          <span className="rounded-md bg-spark/10 px-2 py-0.5 text-xs font-medium text-spark">AI-generated idea</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            aria-label={thumbs === "up" ? "Remove upvote" : "Upvote idea"}
            aria-pressed={thumbs === "up"}
            onClick={() => onThumbs(thumbs === "up" ? null : "up")}
            className="h-11 w-11 active:scale-95 sm:h-9 sm:w-9"
          >
            <ThumbsUp className={cn("size-4 transition-transform", thumbs === "up" && "fill-accent text-accent")} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            aria-label={thumbs === "down" ? "Remove downvote" : "Downvote idea"}
            aria-pressed={thumbs === "down"}
            onClick={() => onThumbs(thumbs === "down" ? null : "down")}
            className="h-11 w-11 active:scale-95 sm:h-9 sm:w-9"
          >
            <ThumbsDown className={cn("size-4 transition-transform", thumbs === "down" && "fill-destructive text-destructive")} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            aria-label={fav ? "Unfavorite idea" : "Favorite idea"}
            aria-pressed={fav}
            onClick={onFav}
            className="h-11 w-11 active:scale-95 sm:h-9 sm:w-9"
          >
            <Star
              key={fav ? "on" : "off"}
              className={cn("size-4", fav && "fill-accent text-accent animate-in zoom-in-75 duration-150")}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>

      <div className={cn("mt-4 space-y-4", showRefined && "hidden")}>
        <h3 className="font-heading text-lg font-semibold text-foreground break-words">{idea.name}</h3>
        <Field label="Problem" value={idea.problem} />
        <Field label="Audience" value={idea.audience} />
        <Field label="What it is" value={idea.description} />
        <Field label="Why now" value={idea.why_now} />
        <Field label="Differentiator" value={idea.differentiator} />
        <Field label="Validate first" value={idea.validate_path} />
        {idea.similar_exists && (
          <p className="text-sm text-muted-foreground break-words">Similar tools may exist — this is the honest part. Your angle matters.</p>
        )}
      </div>

      {showRefined && activeRefined && (
        <div className="mt-4 space-y-4" aria-live="polite">
          <h3 className="font-heading text-lg font-semibold text-foreground break-words">{activeRefined.name}</h3>
          <Field label="Problem" value={activeRefined.problem} />
          <Field label="Audience" value={activeRefined.audience} />
          <Field label="What it is" value={activeRefined.description} />
          <Field label="Why now" value={activeRefined.why_now} />
          <Field label="Differentiator" value={activeRefined.differentiator} />
          <Field label="Validate first" value={activeRefined.validate_path} />
          <div className="rounded-lg border-l-2 border-accent bg-muted p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Biggest open question</h4>
            <p className="mt-1 text-sm text-foreground break-words">{activeRefined.gap}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next steps</h4>
            <ol className="mt-2 space-y-1.5">
              {activeRefined.next_steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground">
                  <span className="font-semibold text-accent-strong" aria-hidden="true">{i + 1}.</span>
                  <span className="break-words">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t pt-3">
        <Button variant="outline" size="sm" onClick={onAction} aria-expanded={expanded}>
          {expanded ? (
            <>
              <ChevronUp className="size-4" aria-hidden="true" /> Show original
            </>
          ) : (
            <>
              {refining ? (
                <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-4" aria-hidden="true" />
              )}
              {refining ? "Refining…" : expanded ? "Show original" : refined ? "Show deeper version" : "Go deeper — get next steps"}
            </>
          )}
        </Button>
      </div>
    </article>
  );
}