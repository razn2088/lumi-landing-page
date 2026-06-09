import "dotenv/config";
import { loadConfig } from "../config.js";
import { createSupabaseClient } from "../db/client.js";
import { SupabaseBrandsRepo, SupabasePostsRepo, SupabaseConfigRepo } from "../db/supabaseRepos.js";
import { ProviderRegistry } from "../providers/registry.js";
import { ProviderRouter } from "../providers/router.js";
import { InstagramPublisher } from "../providers/publisher/instagram.js";
import { publishApprovedPosts } from "../pipeline/publish.js";

async function main() {
  const cfg = loadConfig();
  const sb = createSupabaseClient(cfg);
  const brands = new SupabaseBrandsRepo(sb);
  const posts = new SupabasePostsRepo(sb);
  const config = new SupabaseConfigRepo(sb);

  const reg = new ProviderRegistry();
  reg.register("publisher", "instagram", new InstagramPublisher());
  const router = new ProviderRouter(reg);

  console.log("Publishing approved posts to Instagram ...");
  const res = await publishApprovedPosts({ brands, posts, config, router, publisherChain: ["instagram"] });
  console.log(`Published ${res.published}, failed ${res.failed}, skipped ${res.skipped}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
