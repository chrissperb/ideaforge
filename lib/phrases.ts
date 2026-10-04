export const GENERATING_PHRASES = [
  "Collecting sparks…",
  "Wiring friction to your domain…",
  "Polishing a few gems…",
  "Cutting to what to build first…",
] as const;

export function randomGeneratingPhrase(): string {
  return GENERATING_PHRASES[Math.floor(Math.random() * GENERATING_PHRASES.length)];
}