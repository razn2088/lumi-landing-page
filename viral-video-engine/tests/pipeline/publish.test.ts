import { describe, it, expect } from "vitest";
import { publishApprovedPosts, type PublishDeps } from "../../src/pipeline/publish.js";
import { MemoryBrandsRepo, MemoryPostsRepo, MemoryConfigRepo } from "../../src/db/memoryRepos.js";
import { ProviderRegistry } from "../../src/providers/registry.js";
import { ProviderRouter } from "../../src/providers/router.js";
import { FakePublisher } from "../../src/providers/publisher/fake.js";
import { BrandSchema } from "../../src/types/domain.js";

function deps(brands: MemoryBrandsRepo, posts: MemoryPostsRepo, token: string | null = "SYSTOKEN"): PublishDeps {
  const reg = new ProviderRegistry();
  reg.register("publisher", "instagram", new FakePublisher());
  const config = new MemoryConfigRepo();
  if (token) config.seed("ig_system_user_token", token);
  return { brands, posts, config, router: new ProviderRouter(reg), publisherChain: ["instagram"] };
}

const content = { script: { hook: "h", beats: [{ kind: "broll", voiceover: "b", brollKeywords: [] }], cta: "c" }, caption: "cap", hashtags: ["#a"] };

describe("publishApprovedPosts", () => {
  it("publishes an approved post for an IG-enabled brand and marks it published", async () => {
    const brands = new MemoryBrandsRepo([BrandSchema.parse({ id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com", wpApiBase: "https://x/api", igEnabled: true, igUserId: "IG1" })]);
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

  it("skips everything when no system-user token is configured", async () => {
    const brands = new MemoryBrandsRepo([BrandSchema.parse({ id: "topdealsus", name: "T", siteUrl: "https://t.com", wpApiBase: "https://x/api", igEnabled: true, igUserId: "IG1" })]);
    const posts = new MemoryPostsRepo();
    const p = await posts.upsertForArticle("44444444-4444-4444-4444-444444444444", "topdealsus", content as any);
    await posts.saveRender(p.id, "https://v/x.mp4");
    (await posts.getById(p.id))!.status = "approved";
    const res = await publishApprovedPosts(deps(brands, posts, null));
    expect(res.published).toBe(0);
  });

  it("skips an approved post scheduled in the future, publishes a due one", async () => {
    const brands = new MemoryBrandsRepo([BrandSchema.parse({ id: "topdealsus", name: "T", siteUrl: "https://t.com", wpApiBase: "https://x/api", igEnabled: true, igUserId: "IG1" })]);
    const posts = new MemoryPostsRepo();
    const future = await posts.upsertForArticle("55555555-5555-5555-5555-555555555555", "topdealsus", content as any);
    await posts.saveRender(future.id, "https://v/f.mp4");
    const futureObj = (await posts.getById(future.id))!; futureObj.status = "approved"; futureObj.publishAt = "2999-01-01T00:00:00.000Z";
    const due = await posts.upsertForArticle("66666666-6666-6666-6666-666666666666", "topdealsus", content as any);
    await posts.saveRender(due.id, "https://v/d.mp4");
    const dueObj = (await posts.getById(due.id))!; dueObj.status = "approved"; dueObj.publishAt = "2000-01-01T00:00:00.000Z";

    const res = await publishApprovedPosts(deps(brands, posts));
    expect(res.published).toBe(1);
    expect((await posts.getById(due.id))!.status).toBe("published");
    expect((await posts.getById(future.id))!.status).toBe("approved");
  });
});
