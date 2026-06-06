import type { HandlerMap } from "./dispatcher.js";
import { generateForArticle, type GenerateDeps } from "../pipeline/generate.js";
import type { AssetsDeps } from "../pipeline/assets.js";
import { buildAssetsForPost } from "../pipeline/assets.js";

export function buildHandlers(deps: GenerateDeps): HandlerMap {
  return {
    generate: async (payload) => {
      const articleId = payload.articleId;
      if (typeof articleId !== "string") {
        throw new Error(`generate job missing string articleId, got: ${JSON.stringify(payload.articleId)}`);
      }
      await generateForArticle(articleId, deps);
    },
  };
}

export function buildAssetsHandlers(deps: AssetsDeps): HandlerMap {
  return {
    assets: async (payload) => {
      const postId = payload.postId;
      if (typeof postId !== "string") throw new Error(`assets job missing string postId, got: ${JSON.stringify(payload.postId)}`);
      await buildAssetsForPost(postId, deps);
    },
  };
}
