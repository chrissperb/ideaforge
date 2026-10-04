import { IdeaWizard } from "@/components/idea-wizard";
import { IdeaTicker } from "@/components/idea-ticker";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="relative isolate mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-hidden px-4 py-14 sm:px-6">
      <header className="relative text-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center">
          <div className="absolute -left-36 top-2 h-40 w-40 rounded-full bg-primary/10" />
          <div className="absolute -right-32 -top-6 h-32 w-32 rounded-full border-8 border-accent/20" />
          <div className="absolute -top-8 left-1/3 h-3 w-3 rounded-full bg-accent" />
          <div className="absolute right-1/4 -bottom-10 h-2 w-2 rounded-full bg-accent-strong" />
          <div className="absolute left-10 top-10 h-2 w-2 rounded-full bg-spark/60" />
        </div>
        <p className="mb-2 flex items-center justify-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-accent-strong">
          <Sparkles className="size-4" aria-hidden="true" /> IdeaForge
        </p>
        <h1 className="font-heading text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          Software ideas are no longer scarce because you can&apos;t code.
          <br className="hidden sm:block" />
          <span className="text-muted-foreground">They are scarce because ideas are.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
          Answer 5 quick questions about your real life. Get 3–5 concrete software ideas you could actually build — with who they serve, what makes them different, and how to check demand first. Ideas only: no tech stack, no code.
        </p>
        <IdeaTicker />
      </header>
      <section aria-label="Idea questionnaire" className="rounded-2xl border bg-card p-5 sm:p-8">
        <IdeaWizard />
      </section>
      <footer className="pb-4 text-center text-xs text-muted-foreground">
        AI-generated ideas are suggestions, not product guarantees. Similar tools may exist — that can be a good thing.
      </footer>
    </main>
  );
}