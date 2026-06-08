import { describe, it, expect } from "vitest";
import { publishApprovedPosts, type PublishDeps } from "../../src/pipeline/publish.js";
import { MemoryBrandsRepo, MemoryPostsRepo } from "../../src/db/memoryRepos.js";
import { ProviderRegistry } from "../../src/providers/registry.js";
import { ProviderRouter } from "../../src/providers/router.js";
import { FakePublisher } from "../../src/providers/publisher/fake.js";
import { BrandSchema } from "../../src/types/domain.js";

function deps(brands: MemoryBrandsRepo, posts: MemoryPostsRepo): PublishDeps {
  const reg = new ProviderRegistry();
  reg.register("publisher", "instagram", new FakePublisher());
  return { brands, posts, router: new ProviderRouter(reg), publisherChain: ["instagram"] };
}

const content = { script: { hook: "h", beats: [{ kind: "broll", voiceover: "b", brollKeywords: [] }], cta: "c" }, caption: "cap", hashtags: ["#a"] };

describe("publishApprovedPosts", () => {
  it("publishes an approved post for an IG-enabled brand and marks it published", async () => {
    const brands = new MemoryBrandsRepo([BrandSchema.parse({ id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com", wpApiBase: "https://x/api", igEnabled: true, igUserId: "IG1", igAccessToken: "TOK" })]);
    const posts = new MemoryPostsRepo();
    const p = await posts.upsertForArticle("11111111-1111-1111-1111-111111111111", "topdealsus", content as any);
    await posts.saveRender(p.id, "https://v/x.mp4");
    // move to approved
    (await posts.getById(p.id))!.status = "approved";

    const res = await publishApprovedPosts(deps(brands, posts));
    expect(res.published).toBe(1);
    const after = await posts.getById(p.id);
    expect(after!.status).toBe("published");
    expect(after!.igMediaId).toBe("fake-media-IG1");
  });

  it("skips brands without IG enabled", async () => {
    const brands = new MemoryBrandsRepo([BrandSchema.parse({ id: "topdealsus", name: "T", siteUrl: "https://t.com", wpApiBase: "https://x/api" })]);
    const posts = new MemoryPostsRepo();
    const p = await posts.upsertForArticle("22222222-2222-2222-2222-222222222222", "topdealsus", content as any);
    await posts.saveRender(p.id, "https://v/x.mp4");
    (await posts.getById(p.id))!.status = "approved";

    const res = await publishApprovedPosts(deps(brands, posts));
    expect(res.published).toBe(0);
    expect(res.skipped).toBe(1);
    expect((await posts.getById(p.id))!.status).toBe("approved");
  });
});
