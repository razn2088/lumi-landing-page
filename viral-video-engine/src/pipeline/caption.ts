/** Builds the Instagram caption: the post caption plus a deduped hashtag line. */
export function composeCaption(caption: string, hashtags: string[]): string {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of hashtags) {
    const tag = raw.trim().replace(/^#+/, "");
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(`#${tag}`);
  }
  const base = caption.trim();
  return tags.length ? `${base}\n\n${tags.join(" ")}` : base;
}
