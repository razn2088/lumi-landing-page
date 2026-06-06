import type { ArticlesRepo, BrandsRepo, JobsRepo, PostsRepo } from "../db/repositories.js";
import type { ProviderRouter } from "../providers/router.js";
import type { StockProvider, TTSProvider, TTSResult } from "../providers/types.js";
import type { StorageClient } from "../storage/types.js";
import type { PostAssets } from "../types/domain.js";

export interface AssetsDeps {
  brands: BrandsRepo;
  articles: ArticlesRepo;
  posts: PostsRepo;
  jobs: JobsRepo;
  storage: StorageClient;
  router: ProviderRouter;
  ttsChain: string[];
  stockChain: string[];
  voiceId?: string;
}

export async function buildAssetsForPost(postId: string, deps: AssetsDeps): Promise<PostAssets> {
  const post = await deps.posts.getById(postId);
  if (!post) throw new Error(`Post not found: ${postId}`);
  const article = await deps.articles.getById(post.articleId);
  if (!article) throw new Error(`Article not found: ${post.articleId}`);
  const brand = await deps.brands.getById(post.brandId);
  if (!brand) throw new Error(`Brand not found: ${post.brandId}`);

  const narration = [post.script.hook, ...post.script.beats.map((b) => b.voiceover), post.script.cta].join(" ");
  const tts = await deps.router.call<TTSProvider, TTSResult>(
    { capability: "tts", chain: deps.ttsChain },
    (p) => p.synthesize({ text: narration, voiceId: deps.voiceId ?? "en-US-Neural2-D" }),
  );
  const voiceoverUrl = await deps.storage.upload(
    `voiceover/${post.id}.${tts.ext}`, tts.audio, tts.ext === "wav" ? "audio/wav" : "audio/mpeg",
  );

  const fallback = article.featuredImageUrl;
  const clipUrls: string[] = [];
  for (const beat of post.script.beats) {
    if (beat.kind === "product_image") {
      if (fallback) clipUrls.push(fallback);
      continue;
    }
    const clip = await deps.router.call<StockProvider, string | null>(
      { capability: "stock", chain: deps.stockChain },
      (p) => p.searchClip(beat.brollKeywords),
    );
    if (clip) clipUrls.push(clip);
    else if (fallback) clipUrls.push(fallback);
  }

  const assets: PostAssets = { voiceoverUrl, voiceoverDurationMs: tts.durationMs, clipUrls };
  await deps.posts.saveAssets(post.id, assets);
  await deps.jobs.enqueue({ type: "render", idempotencyKey: `render:${post.id}`, payload: { postId: post.id, brandId: post.brandId } });
  return assets;
}
