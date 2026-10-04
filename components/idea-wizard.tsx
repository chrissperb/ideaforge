"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, ChevronRight, RefreshCw, Check, Sparkles } from "lucide-react";
import { answerSchema, ageRanges, type Answers } from "@/lib/schema";
import { randomGeneratingPhrase } from "@/lib/phrases";
import { cn } from "@/lib/utils";
import { ResultsView } from "./results-view";

const RADIO_LABELS: Record<string, { value: string; label: string }[]> = {
  skill: [
    { value: "cant-build", label: "I can't build software yet" },
    { value: "no-code", label: "I use no-code / AI tools" },
    { value: "beginner", label: "I'm learning to code" },
    { value: "confident", label: "I build software confidently" },
  ],
  goal: [
    { value: "side-income", label: "A side income" },
    { value: "learn", label: "Learning to build" },
    { value: "save-time", label: "Saving my own time" },
    { value: "own-problem", label: "Solving my own problem" },
    { value: "fun", label: "Just for fun" },
  ],
};
const AGE_LABELS: Record<string, string> = {
  "under-18": "Under 18",
  "18-24": "18–24",
  "25-34": "25–34",
  "35-44": "35–44",
  "45-54": "45–54",
  "55-plus": "55+",
  "prefer-not": "Prefer not to say",
};

interface Step {
  id: string;
  title: string;
  description: string;
  fields: (keyof Answers)[];
}

const STEPS: Step[] = [
  {
    id: "frictions",
    title: "What eats your time?",
    description: "The strongest ideas come from real annoyances. List the repetitive or manual tasks you do by hand.",
    fields: ["frictions", "wishes"],
  },
  {
    id: "knowhow",
    title: "What do you know?",
    description: "Your know-how is raw material. Double-click on your skill level — it changes what ideas fit you.",
    fields: ["knowhow", "skill"],
  },
  {
    id: "people",
    title: "Who would you help?",
    description: "Tools need a specific somebody. Naming them sharpens the ideas.",
    fields: ["people"],
  },
  {
    id: "goal",
    title: "What is this for?",
    description: "Purpose changes what you should build first.",
    fields: ["goal"],
  },
  {
    id: "context",
    title: "Anything else?",
    description: "Optional texture — constraints, place, time budget. All skippable.",
    fields: ["context", "age"],
  },
];

const DEFAULT_VALUES: Answers = {
  frictions: "",
  wishes: "",
  knowhow: "",
  skill: "no-code",
  people: "",
  goal: "side-income",
  context: "",
  age: "prefer-not",
};

const STORAGE_KEY = "ideaforge-answers";

function readStored(): Partial<Answers> {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<Answers>;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // ignore malformed storage
  }
  return {};
}

function StepError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="text-sm font-medium text-destructive">{message}</p>;
}

function CharCounter({ value }: { value: number }) {
  const target = 30;
  const pending = value < target;
  return (
    <p className={cn("text-xs", pending ? "text-amber-600" : "text-muted-foreground")}>
      {value} / {target} characters{pending ? " — be specific, use real examples" : " — great, that's enough signal"}
    </p>
  );
}

export function IdeaWizard() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "loading" | "results">("form");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitErrorRef = useRef<HTMLDivElement>(null);
  const [frictionsLen, setFrictionsLen] = useState(0);
  const [loadingPhrase, setLoadingPhrase] = useState<string | null>(null);

  const form = useForm<Answers>({
    resolver: zodResolver(answerSchema) as Resolver<Answers>,
    mode: "onTouched",
    defaultValues: { ...DEFAULT_VALUES, ...readStored() },
  });
  const { control, trigger, getValues, formState } = form;

  useEffect(() => {
    const cancel = form.subscribe({
      callback: () => {
        try {
          const values = form.getValues();
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values));
          setFrictionsLen((values.frictions ?? "").trim().length);
        } catch {
          // storage unavailable — answers live in memory only
        }
      },
    });
    return cancel;
  }, [form]);

  useEffect(() => {
    if (submitError) submitErrorRef.current?.focus();
  }, [submitError]);

  const stepFields = STEPS[step].fields;
  const canSkip = stepFields.every((f) => f !== "frictions");

  const next = async () => {
    setSubmitError(null);
    const ok = await trigger(stepFields as (keyof Answers)[]);
    if (!ok) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await submit();
    }
  };

  const skip = async () => {
    if (step === STEPS.length - 1) {
      await submit();
    } else {
      setStep(step + 1);
    }
  };

  const submit = async () => {
    const ok = await trigger();
    if (!ok) return;
    setLoadingPhrase(randomGeneratingPhrase());
    setPhase("loading");
    setSubmitError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: getValues(), mode: "generate" }),
      });
      const body = (await res.json()) as { ideas?: unknown; error?: string; message?: string };
      if (!res.ok) {
        const message =
          body.error === "config_missing"
            ? body.message ?? "Server not configured for AI calls yet."
            : body.error === "rate_limit"
              ? "Too many requests — wait a moment, then retry."
              : body.message ?? "Could not generate ideas this time. Retry.";
        setSubmitError(message);
        setPhase("form");
        return;
      }
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // storage unavailable
      }
      setPhase("results");
    } catch {
      setSubmitError("Network hiccup reaching the idea engine. Retry.");
      setPhase("form");
    }
  };

  if (phase === "results") {
    return <ResultsView answers={getValues()} onReset={() => setPhase("form")} />;
  }

  const submitting = phase === "loading";

  return (
    <div className="w-full">
      <div aria-live="polite" className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        <span className="font-medium text-foreground">{STEPS[step].title}</span>
      </div>
      <ol className="mb-6 flex items-center gap-2" aria-label="Progress through the questionnaire">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.id} className="flex-1">
              <button
                type="button"
                onClick={() => done && setStep(i)}
                disabled={!done || submitting}
                aria-current={active ? "step" : undefined}
                aria-label={`${i + 1}. ${s.title}${done ? " — completed" : ""}`}
                className={cn(
                  "flex w-full items-center justify-center gap-1.5 rounded-full border py-1.5 text-xs font-semibold whitespace-nowrap transition-colors",
                  done && "border-primary text-primary-foreground bg-primary cursor-pointer",
                  active && "border-spark text-spark bg-spark/10",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden="true" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <form onSubmit={(e) => { e.preventDefault(); void next(); }} noValidate>
        <div key={step} className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground break-words">{STEPS[step].title}</h2>
            <p className="mt-1 text-muted-foreground break-words">{STEPS[step].description}</p>
          </div>

          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="frictions">What repetitive, manual, or annoying tasks eat your time regularly?</Label>
                <Controller
                  control={control}
                  name="frictions"
                  render={({ field }) => (
                    <Textarea
                      id="frictions"
                      autoFocus
                      placeholder="For example: I reconcile receipts for my partner's small shop every Sunday night…"
                      className="min-h-28"
                      aria-invalid={Boolean(formState.errors.frictions)}
                      aria-describedby={formState.errors.frictions ? "frictions-error" : undefined}
                      {...field}
                    />
                  )}
                />
                {formState.errors.frictions && (
                  <div id="frictions-error" className="space-y-1">
                    <StepError message={formState.errors.frictions.message} />
                  </div>
                )}
                <CharCounter value={frictionsLen} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wishes">
                  What do you wish existed but doesn&apos;t? <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Controller
                  control={control}
                  name="wishes"
                  render={({ field }) => (
                    <Textarea
                      id="wishes"
                      placeholder="Something that reminds you before you forget, that files your own papers…"
                      className="min-h-24"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="knowhow">What domains, hobbies, or jobs do you know deeply? <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Controller
                  control={control}
                  name="knowhow"
                  render={({ field }) => (
                    <Textarea
                      id="knowhow"
                      autoFocus
                      placeholder="Chess coaching, hydroponic gardening, church volunteering, your day job in logistics…"
                      className="min-h-24"
                      {...field}
                    />
                  )}
                />
              </div>
              <fieldset>
                <legend className="mb-2 block text-sm font-medium text-foreground">How comfortable are you building software yourself?</legend>
                <Controller
                  control={control}
                  name="skill"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value ?? "no-code"}
                      onValueChange={field.onChange}
                      aria-label="Your software-building skill level"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        {RADIO_LABELS.skill.map((o) => (
                          <label
                            key={o.value}
                            className="flex items-center gap-2 rounded-lg border p-3 text-sm text-foreground has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-muted"
                          >
                            <RadioGroupItem value={o.value} />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                />
              </fieldset>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="people">Who would you love to help with a tool — and with what? <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Controller
                  control={control}
                  name="people"
                  render={({ field }) => (
                    <Textarea
                      id="people"
                      autoFocus
                      placeholder="My mom, who runs a food truck and counts everything on paper; freelancers juggling invoices…"
                      className="min-h-28"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <fieldset className="space-y-3">
              <legend className="block text-sm font-medium text-foreground">What is this project really for?</legend>
              <Controller
                control={control}
                name="goal"
                render={({ field }) => (
                  <RadioGroup value={field.value ?? "side-income"} onValueChange={field.onChange} aria-label="Your project's purpose">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {RADIO_LABELS.goal.map((o) => (
                        <label
                          key={o.value}
                          className="flex items-center gap-2 rounded-lg border p-3 text-sm text-foreground has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-muted"
                        >
                          <RadioGroupItem value={o.value} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              />
            </fieldset>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="context">Anything else? Constraints, where you live, time budget… <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Controller
                  control={control}
                  name="context"
                  render={({ field }) => (
                    <Textarea
                      id="context"
                      autoFocus
                      placeholder="I have 5 free hours a week; I live in a small town; I want something I can run from my phone…"
                      className="min-h-24"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">
                  Age range <span className="font-normal text-muted-foreground">(optional — only used to tune examples)</span>
                </Label>
                <Controller
                  control={control}
                  name="age"
                  render={({ field }) => (
                    <Select value={field.value ?? "prefer-not"} onValueChange={field.onChange}>
                      <SelectTrigger id="age" className="w-full sm:w-64" aria-label="Age range">
                        <SelectValue placeholder="Prefer not to say" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRanges.map((a) => (
                          <SelectItem key={a} value={a}>{AGE_LABELS[a]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0 || submitting}
          >
            <ChevronLeft className="size-4" aria-hidden="true" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {canSkip && (
              <Button type="button" variant="ghost" onClick={skip} disabled={submitting}>
                Skip this step
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className={step === STEPS.length - 1 ? "bg-spark text-spark-foreground hover:bg-spark/90" : undefined}
            >
              {submitting ? (
                <>
                  <RefreshCw className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> {loadingPhrase ?? "Generating your ideas…"}
                </>
              ) : step === STEPS.length - 1 ? (
                <>
                  Generate my ideas <Sparkles className="size-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </div>

        {submitError && (
          <div
            ref={submitErrorRef}
            tabIndex={-1}
            role="alert"
            className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 outline-none focus-visible:outline-2 focus-visible:outline-ring"
          >
            <p className="text-sm text-foreground">{submitError}</p>
          </div>
        )}
      </form>
    </div>
  );
}