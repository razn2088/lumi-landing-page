import { describe, it, expect } from "vitest";
import { PostSchema } from "../../src/types/domain.js";

describe("Post.publishAt", () => {
  it("accepts an optional publishAt", () => {
    const base = { id: "11111111-1111-1111-1111-111111111111", articleId: "22222222-2222-2222-2222-222222222222", brandId: "b", script: { hook: "h", beats: [{ kind: "broll", voiceover: "v", brollKeywords: [] }], cta: "c" }, caption: "c", createdAt: new Date(0).toISOString() };
    expect(PostSchema.parse(base).publishAt).toBeUndefined();
    expect(PostSchema.parse({ ...base, publishAt: "2026-06-10T12:00:00.000Z" }).publishAt).toBe("2026-06-10T12:00:00.000Z");
  });
});
