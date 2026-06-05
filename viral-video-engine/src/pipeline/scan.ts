import type { Brand } from "../types/domain.js";
import type { ArticlesRepo, JobsRepo } from "../db/repositories.js";
import type { WordPressClient } from "../wordpress/client.js";
import { parseArticle } from "../wordpress/parse.js";

export interface ScanDeps {
  wp: WordPressClient;
  articles: ArticlesRepo;
  jobs: JobsRepo;
}

export interface ScanResult {
  scanned: number;
  inserted: number;
  enqueued: number;
}

export async function scanBrand(brand: Brand, deps: ScanDeps): Promise<ScanResult> {
  const after = (await deps.articles.latestPublishedAt(brand.id)) ?? undefined;
  const posts = await deps.wp.fetchRecentPosts(brand, { after });
  const ordered = [...posts].sort((a, b) => a.date_gmt.localeCompare(b.date_gmt));

  let inserted = 0;
  let enqueued = 0;

  for (const post of ordered) {
    const article = parseArticle(brand, post);
    if (await deps.articles.existsByHash(brand.id, article.contentHash)) continue;
    const saved = await deps.articles.insert(article);
    inserted++;
    const job = await deps.jobs.enqueue({
      type: "generate",
      idempotencyKey: `generate:${saved.id}`,
      payload: { articleId: saved.id, brandId: brand.id },
    });
    if (job) enqueued++;
  }

  return { scanned: posts.length, inserted, enqueued };
}
