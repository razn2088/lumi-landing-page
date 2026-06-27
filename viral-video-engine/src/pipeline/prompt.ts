import type { Article, Brand } from "../types/domain.js";

export interface LLMPrompt {
  system: string;
  user: string;
}

const SHAPE =
  '{"script":{"hook":"...","beats":[{"kind":"broll","voiceover":"...","brollKeywords":["...","..."]}],"cta":"..."},"caption":"...","hashtags":["...","..."]}';

export function buildGeneratePrompt(brand: Brand, article: Article): LLMPrompt {
  const beatRule = brand.useFeaturedImageBeat
    ? 'Make exactly one beat the product reveal with "kind":"product_image"; all other beats use "kind":"broll".'
    : 'Every beat uses "kind":"broll".';

  const system = [
    `You are a short-form vertical video scriptwriter for "${brand.name}", a ${brand.niche} brand.`,
    `Brand voice: ${brand.tone}`,
    `Write a fast, scroll-stopping TikTok/Reels script of about 25-40 seconds.`,
    `Structure: a punchy 2-second HOOK, then 3 to 5 BEATS, then a CTA telling viewers to tap the link in bio for more honest product reviews and side-by-side comparisons.`,
    `Rewrite the source title into a fresh hook; do NOT reuse the verbose original title.`,
    beatRule,
    `For each beat give one spoken "voiceover" line and 2-4 "brollKeywords" for stock footage search. The brollKeywords MUST literally describe what the viewer should SEE for that exact line - the concrete object, product, or scene the voiceover is talking about - so the footage on screen clearly matches the words (e.g. a line about a memory foam topper -> "memory foam mattress topper", "hand pressing soft foam", "cozy made bed"). Use plain, common, searchable nouns, not abstract or brand-specific terms.`,
    `The "caption" is one engaging line plus a link-in-bio nudge.`,
    `Give 3-6 "hashtags" as lowercase words with no spaces and no leading '#'.`,
    `Never use em-dashes (—) or en-dashes (–) anywhere in the script, caption, or hashtags; use a regular hyphen with a space on each side instead.`,
    `Output ONLY valid minified JSON, no markdown fences, matching exactly this shape:`,
    SHAPE,
  ].join("\n");

  const user = [
    `SOURCE TITLE: ${article.title}`,
    `SOURCE URL: ${article.url}`,
    `SOURCE CONTENT:`,
    article.content.slice(0, 6000),
  ].join("\n");

  return { system, user };
}
