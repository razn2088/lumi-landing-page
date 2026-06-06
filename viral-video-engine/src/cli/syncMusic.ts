import "dotenv/config";
import { loadConfig } from "../config.js";
import { createSupabaseClient } from "../db/client.js";
import { SupabaseBrandsRepo } from "../db/supabaseRepos.js";
import { SupabaseStorageClient } from "../storage/supabase.js";
import { createGoogleDriveMusicSource } from "../providers/music/googleDrive.js";
import { syncBrandMusic } from "../pipeline/musicSync.js";

async function main() {
  const cfg = loadConfig();
  if (!cfg.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is required (path to the Drive service-account key file).");
  }
  const sb = createSupabaseClient(cfg);
  const brands = new SupabaseBrandsRepo(sb);
  const storage = new SupabaseStorageClient(sb, cfg.STORAGE_BUCKET);
  const source = createGoogleDriveMusicSource(cfg.GOOGLE_SERVICE_ACCOUNT_JSON);

  const all = await brands.listActive();
  const withFolders = all.filter((b) => b.musicDriveFolderId);
  if (withFolders.length === 0) {
    console.log("No active brands have a musicDriveFolderId set. Nothing to sync.");
    return;
  }
  for (const brand of withFolders) {
    const res = await syncBrandMusic(brand, source, storage);
    console.log(`[${brand.id}] uploaded ${res.uploaded.length} (${res.uploaded.join(", ") || "-"}), skipped ${res.skipped.length}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
