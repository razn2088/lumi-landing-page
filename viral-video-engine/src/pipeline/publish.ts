import type { BrandsRepo, ConfigRepo, PostsRepo } from "../db/repositories.js";
import type { ProviderRouter } from "../providers/router.js";
import type { Publisher, PublishResult } from "../providers/types.js";
import { composeCaption } from "./caption.js";

export interface PublishDeps {
  brands: BrandsRepo;
  posts: PostsRepo;
  config: ConfigRepo;
  router: ProviderRouter;
  publisherChain: string[];
}

export interface PublishSummary { published: number; failed: number; skipped: number; }

export async function publishApprovedPosts(deps: PublishDeps): Promise<PublishSummary> {
  const summary: PublishSummary = { published: 0, failed: 0, skipped: 0 };
  const token = await deps.config.get("ig_system_user_token");
  const approved = await deps.posts.listByStatus("approved");
  const nowMs = Date.now();
  if (!token) { summary.skipped = approved.length; return summary; }

  for (const post of approved) {
    if (post.publishAt && Date.parse(post.publishAt) > nowMs) { summary.skipped += 1; continue; }
    if (!post.videoUrl) { summary.skipped += 1; continue; }
    const brand = await deps.brands.getById(post.brandId);
    if (!brand?.igEnabled || !brand.igUserId) { summary.skipped += 1; continue; }

    const caption = composeCaption(post.caption, post.hashtags);
    try {
      const result = await deps.router.call<Publisher, PublishResult>(
        { capability: "publisher", chain: deps.publisherChain },
        (p) => p.publish({ videoUrl: post.videoUrl!, caption, igUserId: brand.igUserId!, accessToken: token }),
      );
      await deps.posts.markPublished(post.id, result.mediaId, result.permalink);
      summary.published += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await deps.posts.markPublishFailed(post.id, msg);
      summary.failed += 1;
    }
  }
  return summary;
}
