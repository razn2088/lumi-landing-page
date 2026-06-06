import type { HandlerMap } from "./dispatcher.js";
import { generateForArticle, type GenerateDeps } from "../pipeline/generate.js";

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
