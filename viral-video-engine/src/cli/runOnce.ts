import "dotenv/config";
import { loadConfig } from "../config.js";
import { createSupabaseClient } from "../db/client.js";
import { SupabaseBrandsRepo, SupabaseArticlesRepo } from "../db/supabaseRepos.js";
import { HttpWordPressClient } from "../wordpress/client.js";
import { scanAllActive } from "../pipeline/scanAll.js";

async function main() {
  const cfg = loadConfig();
  const sb = createSupabaseClient(cfg);
  const brands = new SupabaseBrandsRepo(sb);
  const articles = new SupabaseArticlesRepo(sb);
  const wp = new HttpWordPressClient();

  const results = await scanAllActive(brands, { wp, articles }, (m) => console.log(m));
  if (results.length === 0) console.log("No active brands to scan.");
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
