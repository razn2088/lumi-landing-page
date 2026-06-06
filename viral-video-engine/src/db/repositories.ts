import type { Article, Brand, Job, JobType, GeneratedContent, Post, PostAssets } from "../types/domain.js";

export interface BrandsRepo {
  getById(id: string): Promise<Brand | null>;
  listActive(): Promise<Brand[]>;
}

export interface ArticlesRepo {
  existsByHash(brandId: string, contentHash: string): Promise<boolean>;
  insert(article: Omit<Article, "id">): Promise<Article>;
  latestPublishedAt(brandId: string): Promise<string | null>;
  getById(id: string): Promise<Article | null>;
}

export interface NewJob {
  type: JobType;
  idempotencyKey: string;
  payload?: Record<string, unknown>;
  runAfter?: string;
  maxAttempts?: number;
}

export interface JobsRepo {
  /** Returns the job, or null if an existing idempotencyKey deduped it. */
  enqueue(job: NewJob): Promise<Job | null>;
  /** Atomically claims one queued job of an allowed type, or null if none ready. */
  claim(types: JobType[], worker: string): Promise<Job | null>;
  complete(id: string): Promise<void>;
  fail(id: string, error: string): Promise<void>;
}

export interface PostsRepo {
  upsertForArticle(articleId: string, brandId: string, content: GeneratedContent): Promise<Post>;
  getByArticleId(articleId: string): Promise<Post | null>;
  getById(postId: string): Promise<Post | null>;
  saveAssets(postId: string, assets: PostAssets): Promise<void>;
}
