import { randomUUID } from "node:crypto";
import type { Article, Brand, Job, JobType, GeneratedContent, Post, PostAssets } from "../types/domain.js";
import type { ArticlesRepo, BrandsRepo, JobsRepo, NewJob, PostsRepo } from "./repositories.js";
import { decideFailState } from "../queue/logic.js";

export class MemoryBrandsRepo implements BrandsRepo {
  constructor(private brands: Brand[] = []) {}
  async getById(id: string) {
    return this.brands.find((b) => b.id === id) ?? null;
  }
  async listActive() {
    return this.brands.filter((b) => b.active);
  }
}

export class MemoryArticlesRepo implements ArticlesRepo {
  private items: Article[] = [];
  async existsByHash(brandId: string, contentHash: string) {
    return this.items.some((a) => a.brandId === brandId && a.contentHash === contentHash);
  }
  async insert(article: Omit<Article, "id">) {
    const saved: Article = { ...article, id: randomUUID() };
    this.items.push(saved);
    return saved;
  }
  async latestPublishedAt(brandId: string) {
    const dates = this.items.filter((a) => a.brandId === brandId).map((a) => a.publishedAt).sort();
    return dates.length ? dates[dates.length - 1]! : null;
  }
  async getById(id: string) {
    return this.items.find((a) => a.id === id) ?? null;
  }
}

export class MemoryJobsRepo implements JobsRepo {
  private items = new Map<string, Job>();
  private keys = new Set<string>();

  async enqueue(job: NewJob): Promise<Job | null> {
    if (this.keys.has(job.idempotencyKey)) return null;
    this.keys.add(job.idempotencyKey);
    const saved: Job = {
      id: randomUUID(),
      type: job.type,
      status: "queued",
      attempts: 0,
      maxAttempts: job.maxAttempts ?? 5,
      idempotencyKey: job.idempotencyKey,
      payload: job.payload ?? {},
      lastError: null,
      runAfter: job.runAfter ?? new Date().toISOString(),
    };
    this.items.set(saved.id, saved);
    return saved;
  }

  async claim(types: JobType[], worker: string): Promise<Job | null> {
    const now = Date.now();
    const ready = [...this.items.values()]
      .filter((j) => j.status === "queued" && types.includes(j.type) && Date.parse(j.runAfter) <= now)
      .sort((a, b) => a.runAfter.localeCompare(b.runAfter));
    const job = ready[0];
    if (!job) return null;
    job.status = "processing";
    job.attempts += 1;
    return job;
  }

  async complete(id: string) {
    const job = this.items.get(id);
    if (job) job.status = "done";
  }

  async fail(id: string, error: string) {
    const job = this.items.get(id);
    if (!job) return;
    job.lastError = error;
    const next = decideFailState(job.attempts, job.maxAttempts);
    if (next.status === "dead") {
      job.status = "dead";
    } else {
      job.status = "queued";
      job.runAfter = new Date(Date.now() + next.runAfterMs).toISOString();
    }
  }

  // test helpers
  peek(id: string) {
    return this.items.get(id) ?? null;
  }
  forceReady(id: string) {
    const job = this.items.get(id);
    if (job) job.runAfter = new Date(0).toISOString();
  }
}

export class MemoryPostsRepo implements PostsRepo {
  private byArticle = new Map<string, Post>();
  async upsertForArticle(articleId: string, brandId: string, content: GeneratedContent): Promise<Post> {
    const existing = this.byArticle.get(articleId);
    const post: Post = {
      id: existing?.id ?? randomUUID(),
      articleId,
      brandId,
      script: content.script,
      caption: content.caption,
      hashtags: content.hashtags,
      status: existing?.status ?? "pending_review",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    this.byArticle.set(articleId, post);
    return post;
  }
  async getByArticleId(articleId: string): Promise<Post | null> {
    return this.byArticle.get(articleId) ?? null;
  }
  async getById(postId: string): Promise<Post | null> {
    for (const p of this.byArticle.values()) if (p.id === postId) return p;
    return null;
  }
  async saveAssets(postId: string, assets: PostAssets): Promise<void> {
    for (const p of this.byArticle.values()) {
      if (p.id === postId) { p.assets = assets; return; }
    }
    throw new Error(`Post not found: ${postId}`);
  }
}
