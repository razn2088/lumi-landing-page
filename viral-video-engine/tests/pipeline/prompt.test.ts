import { describe, it, expect } from "vitest";
import { buildGeneratePrompt } from "../../src/pipeline/prompt.js";
import type { Article, Brand } from "../../src/types/domain.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com",
  wpApiBase: "https://topdealsus.com/wp-json/wp/v2", niche: "Amazon deals",
  tone: "punchy deal-hunter", useFeaturedImageBeat: true, active: true,
};
const article: Article = {
  id: "11111111-1111-1111-1111-111111111111", brandId: "topdealsus", wpPostId: 1,
  url: "https://topdealsus.com/x", title: "5 Best Dehumidifiers", excerpt: "",
  content: "Number 5 is the HOmeLabs 4500. ".repeat(500), imageUrls: [],
  featuredImageUrl: "https://x/f.jpg", contentHash: "h", publishedAt: "2026-06-01T00:00:00.000Z",
};

describe("buildGeneratePrompt", () => {
  it("includes brand voice, the JSON shape, and the article in the prompt", () => {
    const { system, user } = buildGeneratePrompt(brand, article);
    expect(system).toContain("punchy deal-hunter");
    expect(system).toContain('"hook"');
    expect(system).toContain('"hashtags"');
    expect(user).toContain("5 Best Dehumidifiers");
    expect(user).toContain("HOmeLabs 4500");
  });

  it("asks for a product_image beat when the brand enables it", () => {
    const { system } = buildGeneratePrompt(brand, article);
    expect(system).toContain("product_image");
  });

  it("does not ask for a product_image beat when disabled", () => {
    const { system } = buildGeneratePrompt({ ...brand, useFeaturedImageBeat: false }, article);
    expect(system).not.toContain("product_image");
  });

  it("truncates very long article content", () => {
    const { user } = buildGeneratePrompt(brand, article);
    expect(user.length).toBeLessThan(8000);
  });
});
