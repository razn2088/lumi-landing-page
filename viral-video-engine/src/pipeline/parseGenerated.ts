import { GeneratedContentSchema, type GeneratedContent } from "../types/domain.js";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in LLM response");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export function sanitizeDashes(text: string): string {
  return text.replace(/[–—]/g, " - ").replace(/ {2,}/g, " ");
}

function sanitizeGeneratedContent(content: GeneratedContent): GeneratedContent {
  return {
    script: {
      hook: sanitizeDashes(content.script.hook),
      beats: content.script.beats.map((beat) => ({
        ...beat,
        voiceover: sanitizeDashes(beat.voiceover),
        brollKeywords: beat.brollKeywords.map(sanitizeDashes),
        onScreenText: beat.onScreenText === undefined ? undefined : sanitizeDashes(beat.onScreenText),
      })),
      cta: sanitizeDashes(content.script.cta),
    },
    caption: sanitizeDashes(content.caption),
    hashtags: content.hashtags.map(sanitizeDashes),
  };
}

export function parseGeneratedContent(text: string): GeneratedContent {
  return sanitizeGeneratedContent(GeneratedContentSchema.parse(extractJson(text)));
}
