import "dotenv/config";
import { loadConfig } from "../config.js";
import { createSupabaseClient } from "../db/client.js";
import { SupabaseBrandsRepo, SupabaseArticlesRepo, SupabaseJobsRepo, SupabasePostsRepo } from "../db/supabaseRepos.js";
import { ProviderRegistry } from "../providers/registry.js";
import { ProviderRouter } from "../providers/router.js";
import { createAnthropicProvider } from "../providers/llm/anthropic.js";
import { buildHandlers } from "../worker/handlers.js";
import { drain } from "../worker/runtime.js";

async function main() {
  const cfg = loadConfig();
  if (!cfg.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required to process generate jobs.");

  const sb = createSupabaseClient(cfg);
  const brands = new SupabaseBrandsRepo(sb);
  const articles = new SupabaseArticlesRepo(sb);
  const posts = new SupabasePostsRepo(sb);
  const jobs = new SupabaseJobsRepo(sb);

  const reg = new ProviderRegistry();
  reg.register("llm", "claude", createAnthropicProvider(cfg.ANTHROPIC_API_KEY, cfg.ANTHROPIC_MODEL));
  const router = new ProviderRouter(reg);

  const handlers = buildHandlers({ brands, articles, posts, router, llmChain: ["claude"] });
  console.log("Draining generate jobs ...");
  const processed = await drain({ jobs, workerId: cfg.WORKER_ID, handlers });
  console.log(`Processed ${processed} job(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
