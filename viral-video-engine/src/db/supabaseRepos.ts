import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article, Brand, Job, JobType, GeneratedContent, Post, PostAssets } from "../types/domain.js";
import type { ArticlesRepo, BrandsRepo, ConfigRepo, JobsRepo, NewJob, PostsRepo } from "./repositories.js";
import { decideFailState } from "../queue/logic.js";

export function rowToBrand(r: Record<string, any>): Brand {
  return {
    id: r.id, name: r.name, siteUrl: r.site_url, wpApiBase: r.wp_api_base,
    niche: r.niche, tone: r.tone, useFeaturedImageBeat: r.use_featured_image_beat, active: r.active,
    handle: r.handle ?? "", logoUrl: r.logo_url ?? null,
    brandColor: r.brand_color ?? "#ffd60a", musicDriveFolderId: r.music_drive_folder_id ?? null,
    igUserId: r.ig_user_id ?? null, igUsername: r.ig_username ?? null, igAccessToken: r.ig_access_token ?? null, igEnabled: r.ig_enabled ?? false,
  };
}

function rowToJob(r: Record<string, any>): Job {
  return {
    id: r.id, type: r.type, status: r.status, attempts: r.attempts, maxAttempts: r.max_attempts,
    idempotencyKey: r.idempotency_key, payload: r.payload ?? {}, lastError: r.last_error ?? null,
    runAfter: r.run_after,
  };
}

export class SupabaseBrandsRepo implements BrandsRepo {
  constructor(private sb: SupabaseClient) {}
  async getById(id: string): Promise<Brand | null> {
    const { data, error } = await this.sb.from("brands").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? rowToBrand(data) : null;
  }
  async listActive(): Promise<Brand[]> {
    const { data, error } = await this.sb.from("brands").select("*").eq("active", true);
    if (error) throw error;
    return (data ?? []).map(rowToBrand);
  }
}

export class SupabaseArticlesRepo implements ArticlesRepo {
  constructor(private sb: SupabaseClient) {}
  async existsByHash(brandId: string, contentHash: string): Promise<boolean> {
    const { data, error } = await this.sb
      .from("articles").select("id").eq("brand_id", brandId).eq("content_hash", contentHash).maybeSingle();
    if (error) throw error;
    return !!data;
  }
  async insert(a: Omit<Article, "id">): Promise<Article> {
    const { data, error } = await this.sb.from("articles").insert({
      brand_id: a.brandId, wp_post_id: a.wpPostId, url: a.url, title: a.title,
      excerpt: a.excerpt, content: a.content, image_urls: a.imageUrls,
      featured_image_url: a.featuredImageUrl, content_hash: a.contentHash, published_at: a.publishedAt,
    }).select("*").single();
    if (error) throw error;
    return {
      id: data.id, brandId: data.brand_id, wpPostId: data.wp_post_id, url: data.url, title: data.title,
      excerpt: data.excerpt, content: data.content, imageUrls: data.image_urls,
      featuredImageUrl: data.featured_image_url, contentHash: data.content_hash,
      publishedAt: new Date(data.published_at).toISOString(),
    };
  }
  async latestPublishedAt(brandId: string): Promise<string | null> {
    const { data, error } = await this.sb
      .from("articles").select("published_at").eq("brand_id", brandId)
      .order("published_at", { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data?.published_at ? new Date(data.published_at).toISOString() : null;
  }
  async getById(id: string): Promise<Article | null> {
    const { data, error } = await this.sb.from("articles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id, brandId: data.brand_id, wpPostId: data.wp_post_id, url: data.url, title: data.title,
      excerpt: data.excerpt, content: data.content, imageUrls: data.image_urls,
      featuredImageUrl: data.featured_image_url, contentHash: data.content_hash,
      publishedAt: new Date(data.published_at).toISOString(),
    };
  }
}

export class SupabaseJobsRepo implements JobsRepo {
  constructor(private sb: SupabaseClient) {}

  async enqueue(job: NewJob): Promise<Job | null> {
    const { data, error } = await this.sb.from("jobs")
      .upsert({
        type: job.type,
        idempotency_key: job.idempotencyKey,
        payload: job.payload ?? {},
        run_after: job.runAfter ?? new Date().toISOString(),
        max_attempts: job.maxAttempts ?? 5,
      }, { onConflict: "idempotency_key", ignoreDuplicates: true })
      .select("*");
    if (error) throw error;
    return data && data.length > 0 ? rowToJob(data[0]!) : null;
  }

  async claim(types: JobType[], worker: string): Promise<Job | null> {
    const { data, error } = await this.sb.rpc("claim_job", { p_types: types, p_worker: worker });
    if (error) throw error;
    const rows = (data ?? []) as Record<string, any>[];
    return rows.length ? rowToJob(rows[0]!) : null;
  }

  async complete(id: string): Promise<void> {
    const { error } = await this.sb.from("jobs")
      .update({ status: "done", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  }

  async fail(id: string, errorMessage: string): Promise<void> {
    const { data, error } = await this.sb.from("jobs").select("attempts, max_attempts").eq("id", id).single();
    if (error) throw error;
    const next = decideFailState(data.attempts, data.max_attempts);
    const patch =
      next.status === "dead"
        ? { status: "dead", last_error: errorMessage, updated_at: new Date().toISOString() }
        : {
            status: "queued",
            last_error: errorMessage,
            run_after: new Date(Date.now() + next.runAfterMs).toISOString(),
            updated_at: new Date().toISOString(),
          };
    const { error: upErr } = await this.sb.from("jobs").update(patch).eq("id", id);
    if (upErr) throw upErr;
  }
}

export function rowToPost(r: Record<string, any>): Post {
  return {
    id: r.id, articleId: r.article_id, brandId: r.brand_id, script: r.script,
    caption: r.caption, hashtags: r.hashtags ?? [], status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
    videoUrl: r.video_url ?? null,
    igMediaId: r.ig_media_id ?? null,
    igPermalink: r.ig_permalink ?? null,
    lastPublishError: r.last_publish_error ?? null,
    assets: r.voiceover_url
      ? {
          voiceoverUrl: r.voiceover_url,
          voiceoverDurationMs: r.voiceover_duration_ms,
          clipUrls: r.clip_urls ?? [],
          wordTimings: r.word_timings ?? [],
          segments: r.segments ?? [],
        }
      : undefined,
  };
}

export class SupabasePostsRepo implements PostsRepo {
  constructor(private sb: SupabaseClient) {}

  async upsertForArticle(articleId: string, brandId: string, content: GeneratedContent): Promise<Post> {
    const { data, error } = await this.sb.from("posts")
      .upsert({
        article_id: articleId, brand_id: brandId, script: content.script,
        caption: content.caption, hashtags: content.hashtags, updated_at: new Date().toISOString(),
      }, { onConflict: "article_id" })
      .select("*").single();
    if (error) throw error;
    return rowToPost(data);
  }

  async getByArticleId(articleId: string): Promise<Post | null> {
    const { data, error } = await this.sb.from("posts").select("*").eq("article_id", articleId).maybeSingle();
    if (error) throw error;
    return data ? rowToPost(data) : null;
  }
  async getById(postId: string): Promise<Post | null> {
    const { data, error } = await this.sb.from("posts").select("*").eq("id", postId).maybeSingle();
    if (error) throw error;
    return data ? rowToPost(data) : null;
  }
  async saveAssets(postId: string, assets: PostAssets): Promise<void> {
    const { error } = await this.sb.from("posts").update({
      voiceover_url: assets.voiceoverUrl,
      voiceover_duration_ms: assets.voiceoverDurationMs,
      clip_urls: assets.clipUrls,
      word_timings: assets.wordTimings,
      segments: assets.segments,
      updated_at: new Date().toISOString(),
    }).eq("id", postId);
    if (error) throw error;
  }
  async saveRender(postId: string, videoUrl: string): Promise<void> {
    const { error } = await this.sb.from("posts").update({
      video_url: videoUrl,
      status: "rendered",
      updated_at: new Date().toISOString(),
    }).eq("id", postId);
    if (error) throw error;
  }
  async listByStatus(status: string): Promise<Post[]> {
    const { data, error } = await this.sb.from("posts").select("*").eq("status", status).order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToPost);
  }
  async markPublished(postId: string, mediaId: string, permalink: string): Promise<void> {
    const { error } = await this.sb.from("posts").update({
      status: "published", ig_media_id: mediaId, ig_permalink: permalink, last_publish_error: null, updated_at: new Date().toISOString(),
    }).eq("id", postId);
    if (error) throw error;
  }
  async markPublishFailed(postId: string, error: string): Promise<void> {
    const { error: upErr } = await this.sb.from("posts").update({
      status: "publish_failed", last_publish_error: error, updated_at: new Date().toISOString(),
    }).eq("id", postId);
    if (upErr) throw upErr;
  }
}

export class SupabaseConfigRepo implements ConfigRepo {
  constructor(private sb: SupabaseClient) {}
  async get(key: string): Promise<string | null> {
    const { data, error } = await this.sb.from("app_config").select("value").eq("key", key).maybeSingle();
    if (error) throw error;
    return data?.value ?? null;
  }
}
