import { describe, it, expect } from "vitest";
import { MemoryArticlesRepo, MemoryJobsRepo } from "../../src/db/memoryRepos.js";

describe("MemoryArticlesRepo", () => {
  it("inserts and detects duplicates by hash", async () => {
    const repo = new MemoryArticlesRepo();
    await repo.insert({
      brandId: "b", wpPostId: 1, url: "https://x.com/1", title: "t",
      excerpt: "", content: "", imageUrls: [], featuredImageUrl: null,
      contentHash: "h1", publishedAt: "2026-06-01T00:00:00.000Z",
    });
    expect(await repo.existsByHash("b", "h1")).toBe(true);
    expect(await repo.existsByHash("b", "h2")).toBe(false);
  });

  it("returns the latest publishedAt for a brand", async () => {
    const repo = new MemoryArticlesRepo();
    const base = {
      brandId: "b", wpPostId: 1, url: "https://x.com/1", title: "t",
      excerpt: "", content: "", imageUrls: [], featuredImageUrl: null,
    };
    await repo.insert({ ...base, contentHash: "h1", publishedAt: "2026-06-01T00:00:00.000Z" });
    await repo.insert({ ...base, wpPostId: 2, contentHash: "h2", publishedAt: "2026-06-03T00:00:00.000Z" });
    expect(await repo.latestPublishedAt("b")).toBe("2026-06-03T00:00:00.000Z");
  });
});

describe("MemoryJobsRepo", () => {
  it("dedupes enqueue by idempotencyKey", async () => {
    const repo = new MemoryJobsRepo();
    const a = await repo.enqueue({ type: "generate", idempotencyKey: "k1" });
    const b = await repo.enqueue({ type: "generate", idempotencyKey: "k1" });
    expect(a).not.toBeNull();
    expect(b).toBeNull();
  });

  it("claims only allowed types and marks them processing", async () => {
    const repo = new MemoryJobsRepo();
    await repo.enqueue({ type: "generate", idempotencyKey: "k1" });
    await repo.enqueue({ type: "scan", idempotencyKey: "k2" });
    const claimed = await repo.claim(["scan"], "w1");
    expect(claimed?.type).toBe("scan");
    expect(claimed?.status).toBe("processing");
    expect(await repo.claim(["scan"], "w1")).toBeNull(); // no more scan jobs
  });

  it("fail() re-queues below max then dead-letters at max", async () => {
    const repo = new MemoryJobsRepo();
    await repo.enqueue({ type: "scan", idempotencyKey: "k1", maxAttempts: 2 });
    const j1 = await repo.claim(["scan"], "w1"); // attempts -> 1
    await repo.fail(j1!.id, "boom");
    expect(repo.peek(j1!.id)?.status).toBe("queued");
    // force it ready again and exhaust
    repo.forceReady(j1!.id);
    const j2 = await repo.claim(["scan"], "w1"); // attempts -> 2
    await repo.fail(j2!.id, "boom");
    expect(repo.peek(j2!.id)?.status).toBe("dead");
  });
});
