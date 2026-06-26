import type { ArticlesRepo, BrandsRepo, JobsRepo, PostsRepo } from "../db/repositories.js";
import type { ProviderRouter } from "../providers/router.js";
import type { StockProvider, TTSProvider, TTSResult } from "../providers/types.js";
import type { StorageClient } from "../storage/types.js";
import type { Article, PostAssets } from "../types/domain.js";
import { buildNarration } from "../text/narration.js";
import { buildSegments, type BeatPool } from "./segments.js";

const SHOTS_PER_BEAT = 3;

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

/** A StockProvider that can return several clips at once (e.g. Freepik). */
interface MultiStockProvider extends StockProvider {
  searchClips(keywords: string[], count: number): Promise<string[]>;
}
function hasSearchClips(p: StockProvider): p is MultiStockProvider {
  return typeof (p as MultiStockProvider).searchClips === "function";
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
    // broll: pull several stock clips; Freepik clips are tokenized so re-upload them.
    let resolvedKey = "";
    const found = await deps.router.call<StockProvider, string[]>(
      { capability: "stock", chain: deps.stockChain },
      async (p) => {
        resolvedKey = p.key;
        if (hasSearchClips(p)) return p.searchClips(beat.brollKeywords, SHOTS_PER_BEAT);
        const out: string[] = [];
        for (let i = 0; i < SHOTS_PER_BEAT; i++) {
          const c = await p.searchClip(beat.brollKeywords);
          if (c) out.push(c);
        }
        return out;
      },
    );
    let clips = found;
    if (resolvedKey === "freepik") {
      const stable: string[] = [];
      for (const url of found) {
        const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
        stable.push(await deps.storage.upload(`clips/${post.id}/${uploadIdx++}.mp4`, bytes, "video/mp4"));
      }
      clips = stable;
    }
    if (!clips.length && fallback) beatPools.push({ clips: [fallback], clipKind: "image" });
    else beatPools.push({ clips, clipKind: "video" });
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
