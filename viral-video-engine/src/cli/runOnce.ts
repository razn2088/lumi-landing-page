import "dotenv/config";
import { loadConfig } from "../config.js";
import { createSupabaseClient } from "../db/client.js";
import { SupabaseBrandsRepo, SupabaseArticlesRepo, SupabaseJobsRepo } from "../db/supabaseRepos.js";
import { HttpWordPressClient } from "../wordpress/client.js";
import { scanBrand } from "../pipeline/scan.js";

async function main() {
  const cfg = loadConfig();
  const sb = createSupabaseClient(cfg);
  const brands = new SupabaseBrandsRepo(sb);
  const articles = new SupabaseArticlesRepo(sb);
  const jobs = new SupabaseJobsRepo(sb);
  const wp = new HttpWordPressClient();

  const brand = await brands.getById("topdealsus");
  if (!brand) throw new Error("Seed the topdealsus brand first.");

  console.log(`Scanning ${brand.name} (${brand.wpApiBase}) ...`);
  const result = await scanBrand(brand, { wp, articles, jobs });
  console.log("Scan result:", result);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
