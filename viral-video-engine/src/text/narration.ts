import type { Script } from "../types/domain.js";

export function tokenizeWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Full narration the voiceover reads: hook + each beat + cta, in order. */
export function buildNarration(script: Script): string {
  return [script.hook, ...script.beats.map((b) => b.voiceover), script.cta].join(" ");
}

/** Wraps each word in an SSML <mark> so the TTS engine reports its start time. */
export function buildMarkedSsml(narration: string): { ssml: string; words: string[] } {
  const words = tokenizeWords(narration);
  const body = words.map((w, i) => `<mark name="w${i}"/>${escapeXml(w)}`).join(" ");
  return { ssml: `<speak>${body}</speak>`, words };
}
