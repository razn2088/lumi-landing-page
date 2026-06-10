import type { Brand } from "../types/domain.js";
import type { ArticlesRepo } from "../db/repositories.js";
import type { WordPressClient } from "../wordpress/client.js";
import { parseArticle } from "../wordpress/parse.js";

export interface ScanDeps {
  wp: WordPressClient;
  articles: ArticlesRepo;
}

export interface ScanResult {
  scanned: number;
  inserted: number;
}

export async function scanBrand(brand: Brand, deps: ScanDeps): Promise<ScanResult> {
  // Fetch the full published list (paginated) and dedup by content hash, so every
  // article on the site is ingested — not just those newer than the latest we have.
  const posts = await deps.wp.fetchRecentPosts(brand);
  const ordered = [...posts].sort((a, b) => a.date_gmt.localeCompare(b.date_gmt));

  let inserted = 0;

  for (const post of ordered) {
    const article = parseArticle(brand, post);
    if (await deps.articles.existsByHash(brand.id, article.contentHash)) continue;
    await deps.articles.insert(article);
    inserted++;
  }

  return { scanned: posts.length, inserted };
}
