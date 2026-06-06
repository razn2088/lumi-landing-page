import type { ArticlesRepo, BrandsRepo, JobsRepo, PostsRepo } from "../db/repositories.js";
import type { ProviderRouter } from "../providers/router.js";
import type { LLMProvider, LLMResult } from "../providers/types.js";
import type { Post } from "../types/domain.js";
import { buildGeneratePrompt } from "./prompt.js";
import { parseGeneratedContent } from "./parseGenerated.js";

export interface GenerateDeps {
  brands: BrandsRepo;
  articles: ArticlesRepo;
  posts: PostsRepo;
  jobs: JobsRepo;
  router: ProviderRouter;
  llmChain: string[];
}

export async function generateForArticle(articleId: string, deps: GenerateDeps): Promise<Post> {
  const article = await deps.articles.getById(articleId);
  if (!article) throw new Error(`Article not found: ${articleId}`);
  const brand = await deps.brands.getById(article.brandId);
  if (!brand) throw new Error(`Brand not found: ${article.brandId}`);

  const { system, user } = buildGeneratePrompt(brand, article);
  const result = await deps.router.call<LLMProvider, LLMResult>(
    { capability: "llm", chain: deps.llmChain },
    (p) => p.generate({ system, prompt: user, cacheKey: brand.id }),
  );

  const content = parseGeneratedContent(result.text);
  const post = await deps.posts.upsertForArticle(article.id, brand.id, content);
  await deps.jobs.enqueue({ type: "assets", idempotencyKey: `assets:${post.id}`, payload: { postId: post.id, brandId: brand.id } });
  return post;
}
