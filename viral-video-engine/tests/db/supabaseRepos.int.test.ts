import { describe, it, expect, beforeEach } from "vitest";
import { createSupabaseClient } from "../../src/db/client.js";
import {
  SupabaseBrandsRepo, SupabaseArticlesRepo, SupabaseJobsRepo,
} from "../../src/db/supabaseRepos.js";
import { loadConfig } from "../../src/config.js";
import "dotenv/config";

const hasEnv = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const d = hasEnv ? describe : describe.skip;

d("Supabase repositories (integration)", () => {
  const cfg = loadConfig();
  const sb = createSupabaseClient(cfg);
  const brands = new SupabaseBrandsRepo(sb);
  const articles = new SupabaseArticlesRepo(sb);
  const jobs = new SupabaseJobsRepo(sb);

  beforeEach(async () => {
    await sb.from("jobs").delete().neq("idempotency_key", "");
    await sb.from("articles").delete().neq("content_hash", "");
  });

  it("reads the seeded brand", async () => {
    const brand = await brands.getById("topdealsus");
    expect(brand?.name).toBe("Top Deals US");
    expect(brand?.useFeaturedImageBeat).toBe(true);
  });

  it("inserts an article and detects it by hash", async () => {
    const saved = await articles.insert({
      brandId: "topdealsus", wpPostId: 999, url: "https://topdealsus.com/x", title: "X",
      excerpt: "", content: "body", imageUrls: ["https://x/i.jpg"], featuredImageUrl: null,
      contentHash: "hash-int-1", publishedAt: "2026-06-01T00:00:00.000Z",
    });
    expect(saved.id).toBeTruthy();
    expect(await articles.existsByHash("topdealsus", "hash-int-1")).toBe(true);
    expect(await articles.latestPublishedAt("topdealsus")).toBe("2026-06-01T00:00:00.000Z");
  });

  it("enqueues idempotently and claims with SKIP LOCKED", async () => {
    const a = await jobs.enqueue({ type: "scan", idempotencyKey: "int-k1", payload: { brandId: "topdealsus" } });
    const dup = await jobs.enqueue({ type: "scan", idempotencyKey: "int-k1" });
    expect(a).not.toBeNull();
    expect(dup).toBeNull();

    const claimed = await jobs.claim(["scan"], "w1");
    expect(claimed?.id).toBe(a!.id);
    expect(claimed?.status).toBe("processing");
    expect(await jobs.claim(["scan"], "w1")).toBeNull();

    await jobs.complete(claimed!.id);
  });

  it("fail() re-queues with a future run_after", async () => {
    const a = await jobs.enqueue({ type: "scan", idempotencyKey: "int-k2" });
    await jobs.claim(["scan"], "w1");
    await jobs.fail(a!.id, "boom");
    expect(await jobs.claim(["scan"], "w1")).toBeNull();
  });
});
