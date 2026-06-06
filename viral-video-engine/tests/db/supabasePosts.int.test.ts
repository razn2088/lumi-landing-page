import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createSupabaseClient } from "../../src/db/client.js";
import { SupabaseArticlesRepo, SupabasePostsRepo } from "../../src/db/supabaseRepos.js";
import { loadConfig } from "../../src/config.js";
import type { GeneratedContent } from "../../src/types/domain.js";
import "dotenv/config";

const hasEnv = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const d = hasEnv ? describe : describe.skip;

const TEST_BRAND = "__inttest__";
const content: GeneratedContent = {
  script: { hook: "h", beats: [{ kind: "broll", voiceover: "v", brollKeywords: ["k"] }], cta: "c" },
  caption: "cap", hashtags: ["deals"],
};

d("Supabase posts + article getById (integration)", () => {
  const cfg = loadConfig();
  const sb = createSupabaseClient(cfg);
  const articles = new SupabaseArticlesRepo(sb);
  const posts = new SupabasePostsRepo(sb);

  beforeAll(async () => {
    await sb.from("brands").upsert({
      id: TEST_BRAND, name: "int test", site_url: "https://x", wp_api_base: "https://x/wp-json/wp/v2",
      niche: "n", tone: "t", use_featured_image_beat: false, active: false,
    });
    await sb.from("posts").delete().eq("brand_id", TEST_BRAND);
    await sb.from("articles").delete().eq("brand_id", TEST_BRAND);
  });

  afterAll(async () => {
    await sb.from("posts").delete().eq("brand_id", TEST_BRAND);
    await sb.from("articles").delete().eq("brand_id", TEST_BRAND);
  });

  it("getById returns an inserted article", async () => {
    const a = await articles.insert({
      brandId: TEST_BRAND, wpPostId: 1, url: "https://x/1", title: "t",
      excerpt: "", content: "b", imageUrls: [], featuredImageUrl: null,
      contentHash: "inttest-hash-1", publishedAt: "2026-06-01T00:00:00.000Z",
    });
    const fetched = await articles.getById(a.id);
    expect(fetched?.title).toBe("t");
    expect(await articles.getById("00000000-0000-0000-0000-000000000000")).toBeNull();
  });

  it("upserts a post for an article and reads it back; re-upsert keeps the same id", async () => {
    const a = await articles.insert({
      brandId: TEST_BRAND, wpPostId: 2, url: "https://x/2", title: "t2",
      excerpt: "", content: "b", imageUrls: [], featuredImageUrl: null,
      contentHash: "inttest-hash-2", publishedAt: "2026-06-02T00:00:00.000Z",
    });
    const first = await posts.upsertForArticle(a.id, TEST_BRAND, content);
    expect(first.status).toBe("pending_review");
    const second = await posts.upsertForArticle(a.id, TEST_BRAND, { ...content, caption: "updated" });
    expect(second.id).toBe(first.id);
    expect((await posts.getByArticleId(a.id))?.caption).toBe("updated");
  });
});
