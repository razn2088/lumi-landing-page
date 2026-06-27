import "dotenv/config";
import { loadConfig } from "../config.js";
import { createSupabaseClient } from "../db/client.js";
import { SupabaseBrandsRepo, SupabaseArticlesRepo, SupabaseJobsRepo, SupabasePostsRepo } from "../db/supabaseRepos.js";
import { ProviderRegistry } from "../providers/registry.js";
import { ProviderRouter } from "../providers/router.js";
import { createAnthropicProvider } from "../providers/llm/anthropic.js";
import { GoogleTTSProvider } from "../providers/tts/google.js";
import { ElevenLabsTTSProvider } from "../providers/tts/elevenlabs.js";
import { PexelsStockProvider } from "../providers/stock/pexels.js";
import { FreepikStockProvider } from "../providers/stock/freepik.js";
import { SupabaseStorageClient } from "../storage/supabase.js";
import { buildHandlers, buildAssetsHandlers } from "../worker/handlers.js";
import type { HandlerMap } from "../worker/dispatcher.js";
import { drain } from "../worker/runtime.js";

async function main() {
  const cfg = loadConfig();
  if (!cfg.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required.");

  const sb = createSupabaseClient(cfg);
  const brands = new SupabaseBrandsRepo(sb);
  const articles = new SupabaseArticlesRepo(sb);
  const posts = new SupabasePostsRepo(sb);
  const jobs = new SupabaseJobsRepo(sb);
  const storage = new SupabaseStorageClient(sb, cfg.STORAGE_BUCKET);

  const reg = new ProviderRegistry();
  reg.register("llm", "claude", createAnthropicProvider(cfg.ANTHROPIC_API_KEY, cfg.ANTHROPIC_MODEL));
  if (cfg.GOOGLE_TTS_API_KEY) reg.register("tts", "google", new GoogleTTSProvider(cfg.GOOGLE_TTS_API_KEY));
  if (cfg.ELEVENLABS_API_KEY) reg.register("tts", "elevenlabs", new ElevenLabsTTSProvider(cfg.ELEVENLABS_API_KEY, cfg.ELEVENLABS_VOICE_ID, cfg.ELEVENLABS_MODEL, cfg.ELEVENLABS_SPEED));
  if (cfg.FREEPIK_API_KEY) reg.register("stock", "freepik", new FreepikStockProvider(cfg.FREEPIK_API_KEY));
  if (cfg.PEXELS_API_KEY) reg.register("stock", "pexels", new PexelsStockProvider(cfg.PEXELS_API_KEY));
  const router = new ProviderRouter(reg);

  const handlers: HandlerMap = { ...buildHandlers({ brands, articles, posts, jobs, router, llmChain: ["claude"] }) };

  const ttsChain = [
    ...(cfg.ELEVENLABS_API_KEY ? ["elevenlabs"] : []),
    ...(cfg.GOOGLE_TTS_API_KEY ? ["google"] : []),
  ];
  // Pexels first: portrait video (better look). Freepik (portrait photos) only as a fallback.
  const stockChain = [
    ...(cfg.PEXELS_API_KEY ? ["pexels"] : []),
    ...(cfg.FREEPIK_API_KEY ? ["freepik"] : []),
  ];
  const assetsEnabled = ttsChain.length > 0 && stockChain.length > 0;
  if (assetsEnabled) {
    Object.assign(handlers, buildAssetsHandlers({ brands, articles, posts, jobs, storage, router, ttsChain, stockChain }));
  } else {
    console.log("(assets handler disabled: set a TTS key (ELEVENLABS_API_KEY or GOOGLE_TTS_API_KEY) + a stock key (FREEPIK_API_KEY or PEXELS_API_KEY) to enable; assets jobs stay queued)");
  }

  console.log(`Draining generate${assetsEnabled ? " + assets" : ""} jobs ...`);
  const processed = await drain({ jobs, workerId: cfg.WORKER_ID, handlers });
  console.log(`Processed ${processed} job(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
