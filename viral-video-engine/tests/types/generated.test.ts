import { describe, it, expect } from "vitest";
import { ScriptSchema, GeneratedContentSchema, PostSchema } from "../../src/types/domain.js";

describe("script + generated content schemas", () => {
  it("parses a valid script with beat defaults", () => {
    const s = ScriptSchema.parse({
      hook: "Stop overpaying for this",
      beats: [{ voiceover: "Number 5 will surprise you", brollKeywords: ["dehumidifier"] }],
      cta: "Link in bio",
    });
    expect(s.beats[0]!.kind).toBe("broll"); // default
  });

  it("rejects a script with no beats", () => {
    expect(() => ScriptSchema.parse({ hook: "h", beats: [], cta: "c" })).toThrow();
  });

  it("parses generated content and defaults hashtags to []", () => {
    const g = GeneratedContentSchema.parse({
      script: { hook: "h", beats: [{ voiceover: "v" }], cta: "c" },
      caption: "great deals today",
    });
    expect(g.hashtags).toEqual([]);
    expect(g.script.beats[0]!.brollKeywords).toEqual([]); // default
  });

  it("parses a post and defaults status", () => {
    const p = PostSchema.parse({
      id: "11111111-1111-1111-1111-111111111111",
      articleId: "22222222-2222-2222-2222-222222222222",
      brandId: "topdealsus",
      script: { hook: "h", beats: [{ voiceover: "v" }], cta: "c" },
      caption: "c",
      createdAt: "2026-06-06T00:00:00.000Z",
    });
    expect(p.status).toBe("pending_review");
    expect(p.hashtags).toEqual([]);
  });
});
