import { describe, it, expect, vi, afterEach } from "vitest";
import { HttpWordPressClient } from "../../src/wordpress/client.js";
import { FakeWordPressClient } from "../../src/wordpress/fakeClient.js";
import posts from "../../test/fixtures/topdealsus-posts.json" with { type: "json" };
import type { Brand } from "../../src/types/domain.js";
import type { WpPost } from "../../src/wordpress/parse.js";

const brand: Brand = {
  id: "topdealsus", name: "Top Deals US",
  siteUrl: "https://topdealsus.com", wpApiBase: "https://topdealsus.com/wp-json/wp/v2",
  niche: "deals", tone: "punchy", useFeaturedImageBeat: true, active: true,
  handle: "", logoUrl: null, brandColor: "#ffd60a", musicDriveFolderId: null,
};

afterEach(() => vi.restoreAllMocks());

describe("HttpWordPressClient", () => {
  it("requests the posts endpoint with embed + ordering and returns JSON", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(posts), { status: 200 }),
    );
    const client = new HttpWordPressClient();
    const result = await client.fetchRecentPosts(brand, { perPage: 5, after: "2026-05-01T00:00:00Z" });
    expect(result).toHaveLength(2);
    const url = (spy.mock.calls[0]![0] as string);
    expect(url).toContain("https://topdealsus.com/wp-json/wp/v2/posts?");
    expect(url).toContain("_embed=1");
    expect(url).toContain("orderby=date");
    expect(url).toContain("after=2026-05-01");
  });

  it("throws on a non-OK response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 503 }));
    const client = new HttpWordPressClient();
    await expect(client.fetchRecentPosts(brand)).rejects.toThrow("503");
  });
});

describe("FakeWordPressClient", () => {
  it("returns the posts it was seeded with", async () => {
    const client = new FakeWordPressClient(posts as WpPost[]);
    expect(await client.fetchRecentPosts(brand)).toHaveLength(2);
  });
});
