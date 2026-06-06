import "dotenv/config";
import path from "node:path";
import os from "node:os";
import { promises as fs } from "node:fs";
import type { WebpackOverrideFn } from "@remotion/bundler";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import { loadConfig } from "../config.js";
import { createSupabaseClient } from "../db/client.js";
import { SupabaseBrandsRepo, SupabaseJobsRepo, SupabasePostsRepo } from "../db/supabaseRepos.js";
import { SupabaseStorageClient } from "../storage/supabase.js";
import { buildRenderProps } from "../render/props.js";
import { pickBrandTrack } from "../pipeline/musicPicker.js";

const webpackOverride: WebpackOverrideFn = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    extensionAlias: { ".js": [".ts", ".tsx", ".js"], ".jsx": [".tsx", ".jsx"] },
  },
});

async function main() {
  const cfg = loadConfig();
  const sb = createSupabaseClient(cfg);
  const brands = new SupabaseBrandsRepo(sb);
  const posts = new SupabasePostsRepo(sb);
  const jobs = new SupabaseJobsRepo(sb);
  const storage = new SupabaseStorageClient(sb, cfg.STORAGE_BUCKET);

  console.log("Bundling Remotion project ...");
  const serveUrl = await bundle({ entryPoint: path.resolve("remotion/index.ts"), webpackOverride });

  let processed = 0;
  for (;;) {
    const job = await jobs.claim(["render"], cfg.WORKER_ID);
    if (!job) break;
    const postId = String(job.payload.postId ?? "");
    try {
      const post = await posts.getById(postId);
      if (!post) throw new Error(`Post not found: ${postId}`);
      const brand = await brands.getById(post.brandId);
      if (!brand) throw new Error(`Brand not found: ${post.brandId}`);

      const musicUrl = await pickBrandTrack(storage, brand.id, post.id);
      const inputProps = buildRenderProps(post, brand, musicUrl) as unknown as Record<string, unknown>;
      const composition = await selectComposition({ serveUrl, id: "video", inputProps });
      const outPath = path.join(os.tmpdir(), `${postId}.mp4`);
      console.log(`Rendering ${postId} (${composition.durationInFrames} frames) ...`);
      await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: outPath, inputProps });

      const bytes = new Uint8Array(await fs.readFile(outPath));
      const videoUrl = await storage.upload(`video/${postId}.mp4`, bytes, "video/mp4");
      await posts.saveRender(postId, videoUrl);
      await jobs.complete(job.id);
      await fs.unlink(outPath).catch(() => undefined);
      console.log(`Done ${postId} -> ${videoUrl}`);
      processed += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`Render failed for ${postId}: ${msg}`);
      await jobs.fail(job.id, msg);
    }
  }
  console.log(`Rendered ${processed} video(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
