"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const PAIRS = [
  {
    friction: "I reconcile my partner's shop receipts every Sunday by hand…",
    idea: "a phone scanner that turns a shoebox of receipts into a ready accountant file.",
  },
  {
    friction: "Same intro email re-sent to 40 venues every single week…",
    idea: "a compose app that personalizes your pitch in your own voice, one click per venue.",
  },
  {
    friction: "Missed three rent-payment reminders this year…",
    idea: "an SMS agent that nudges you three days early, tuned to your calendar.",
  },
];

export function IdeaTicker() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % PAIRS.length), 4500);
    return () => clearInterval(t);
  }, [paused]);

  const current = PAIRS[idx];

  return (
    <div
      className="mx-auto mt-6 max-w-xl rounded-xl border bg-card p-4 text-left"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      tabIndex={0}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Example idea preview. Auto-rotates unless paused."
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-spark">
        <Sparkles className="size-3.5" aria-hidden="true" /> Preview — an idea you could get
      </p>
      <p key={idx} className="mt-2 text-sm leading-relaxed text-foreground animate-in fade-in slide-in-from-bottom-1 duration-300">
        “{current.friction}” → {current.idea}
      </p>
    </div>
  );
}