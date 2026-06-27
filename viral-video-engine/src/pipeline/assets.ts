import type { ArticlesRepo, BrandsRepo, JobsRepo, PostsRepo } from "../db/repositories.js";
import type { ProviderRouter } from "../providers/router.js";
import type { StockProvider, TTSProvider, TTSResult } from "../providers/types.js";
import type { StorageClient } from "../storage/types.js";
import type { Article, PostAssets } from "../types/domain.js";
import { buildNarration } from "../text/narration.js";
import { buildSegments, type BeatPool } from "./segments.js";

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

function productImages(article: Article): string[] {
  if (article.imageUrls.length) return article.imageUrls;
  return article.featuredImageUrl ? [article.featuredImageUrl] : [];
}

export async function buildAssetsForPost(postId: string, deps: AssetsDeps): Promise<PostAssets> {
  const post = await deps.posts.getById(postId);
  if (!post) throw new Error(`Post not found: ${postId}`);
  const article = await deps.articles.getById(post.articleId);
  if (!article) throw new Error(`Article not found: ${post.articleId}`);
  const brand = await deps.brands.getById(post.brandId);
  if (!brand) throw new Error(`Brand not found: ${post.brandId}`);

  const narration = buildNarration(post.script);
  const tts = await deps.router.call<TTSProvider, TTSResult>(
    { capability: "tts", chain: deps.ttsChain },
    (p) => p.synthesize({ text: narration, voiceId: deps.voiceId ?? "en-US-Neural2-D" }),
  );
  const voiceoverUrl = await deps.storage.upload(
    `voiceover/${post.id}.${tts.ext}`, tts.audio, tts.ext === "wav" ? "audio/wav" : "audio/mpeg",
  );

  const fallback = article.featuredImageUrl;
  let uploadIdx = 0;
  const used = new Set<string>(); // dedupe: a clip never repeats within the same video
  const beatPools: BeatPool[] = [];
  for (const beat of post.script.beats) {
    // Product reveal beat -> the actual product image (most relevant to the words).
    if (beat.kind === "product_image") {
      const img = productImages(article).find((u) => !used.has(u));
      if (img) { used.add(img); beatPools.push({ clips: [img], clipKind: "image" }); continue; }
    }
    // broll: pick ONE matching clip, held for the beat, that has not been used yet in this video.
    let resolvedKey = "";
    const candidates = await deps.router.call<StockProvider, string[]>(
      { capability: "stock", chain: deps.stockChain },
      async (p) => { resolvedKey = p.key; return p.searchClips(beat.brollKeywords, 6); },
    );
    let pick = candidates.find((c) => !used.has(c)) ?? candidates[0] ?? null;
    let clips: string[] = [];
    if (pick) {
      used.add(pick);
      if (resolvedKey === "freepik") {
        // Freepik (fallback) download URLs are tokenized/expiring — re-upload to stable storage.
        const ext = (pick.split("?")[0]!.split(".").pop() || "jpg").toLowerCase();
        const ctype = ext === "mp4" ? "video/mp4" : ext === "png" ? "image/png" : "image/jpeg";
        const bytes = new Uint8Array(await (await fetch(pick)).arrayBuffer());
        pick = await deps.storage.upload(`clips/${post.id}/${uploadIdx++}.${ext}`, bytes, ctype);
      }
      clips = [pick];
    }
    const clipKind = resolvedKey === "freepik" ? "image" : "video";
    if (!clips.length && fallback) beatPools.push({ clips: [fallback], clipKind: "image" });
    else beatPools.push({ clips, clipKind });
  }

  const clipUrls = [...new Set(beatPools.flatMap((p) => p.clips))];
  const segments = buildSegments(post.script, beatPools, tts.wordTimings, tts.durationMs);

  const assets: PostAssets = {
    voiceoverUrl,
    voiceoverDurationMs: tts.durationMs,
    clipUrls,
    wordTimings: tts.wordTimings,
    segments,
  };
  await deps.posts.saveAssets(post.id, assets);
  await deps.jobs.enqueue({ type: "render", idempotencyKey: `render:${post.id}`, payload: { postId: post.id, brandId: post.brandId } });
  return assets;
}
