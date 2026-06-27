import type { ArticlesRepo, BrandsRepo, JobsRepo, PostsRepo } from "../db/repositories.js";
import type { ProviderRouter } from "../providers/router.js";
import type { StockProvider, TTSProvider, TTSResult } from "../providers/types.js";
import type { StorageClient } from "../storage/types.js";
import type { Article, PostAssets } from "../types/domain.js";
import { buildNarration } from "../text/narration.js";
import { buildSegments, type BeatPool } from "./segments.js";

const BROLL_SHOTS = 3; // distinct stock clips per broll beat (renderer cuts among them)

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
  const beatPools: BeatPool[] = [];
  for (const beat of post.script.beats) {
    if (beat.kind === "product_image") {
      beatPools.push({ clips: productImages(article), clipKind: "image" });
      continue;
    }
    // broll: several DISTINCT stock video clips per beat → fast cuts to different footage.
    let resolvedKey = "";
    const found = await deps.router.call<StockProvider, string[]>(
      { capability: "stock", chain: deps.stockChain },
      async (p) => { resolvedKey = p.key; return p.searchClips(beat.brollKeywords, BROLL_SHOTS); },
    );
    let clips = found;
    if (resolvedKey === "freepik" && clips.length) {
      // Freepik (fallback) download URLs are tokenized/expiring — re-upload to stable storage.
      const stable: string[] = [];
      for (const url of clips) {
        const ext = (url.split("?")[0]!.split(".").pop() || "jpg").toLowerCase();
        const ctype = ext === "mp4" ? "video/mp4" : ext === "png" ? "image/png" : "image/jpeg";
        const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
        stable.push(await deps.storage.upload(`clips/${post.id}/${uploadIdx++}.${ext}`, bytes, ctype));
      }
      clips = stable;
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
