import type { BrandsRepo, PostsRepo } from "../db/repositories.js";
import type { ProviderRouter } from "../providers/router.js";
import type { Publisher, PublishResult } from "../providers/types.js";
import { composeCaption } from "./caption.js";

export interface PublishDeps {
  brands: BrandsRepo;
  posts: PostsRepo;
  router: ProviderRouter;
  publisherChain: string[];
}

export interface PublishSummary { published: number; failed: number; skipped: number; }

/** Posts every approved + rendered video whose brand has Instagram enabled. */
export async function publishApprovedPosts(deps: PublishDeps): Promise<PublishSummary> {
  const approved = await deps.posts.listByStatus("approved");
  const summary: PublishSummary = { published: 0, failed: 0, skipped: 0 };

  for (const post of approved) {
    if (!post.videoUrl) { summary.skipped += 1; continue; }
    const brand = await deps.brands.getById(post.brandId);
    if (!brand?.igEnabled || !brand.igUserId || !brand.igAccessToken) { summary.skipped += 1; continue; }

    const caption = composeCaption(post.caption, post.hashtags);
    try {
      const result = await deps.router.call<Publisher, PublishResult>(
        { capability: "publisher", chain: deps.publisherChain },
        (p) => p.publish({ videoUrl: post.videoUrl!, caption, igUserId: brand.igUserId!, accessToken: brand.igAccessToken! }),
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
