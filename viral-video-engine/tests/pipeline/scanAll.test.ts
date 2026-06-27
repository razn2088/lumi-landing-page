import { describe, it, expect } from "vitest";
import { scanAllActive } from "../../src/pipeline/scanAll.js";
import { MemoryBrandsRepo, MemoryArticlesRepo } from "../../src/db/memoryRepos.js";
import type { Brand } from "../../src/types/domain.js";
import type { WordPressClient } from "../../src/wordpress/client.js";

function brand(id: string, active: boolean): Brand {
  return {
    id, name: id, siteUrl: `https://${id}.com`, wpApiBase: `https://${id}.com/wp-json/wp/v2`,
    niche: "", tone: "", useFeaturedImageBeat: false, active,
    handle: "", logoUrl: null, brandColor: "#ffd60a", musicDriveFolderId: null,
  };
}

const wp: WordPressClient = { async fetchRecentPosts() { return []; } };

describe("scanAllActive", () => {
  it("scans active brands in order and skips inactive ones", async () => {
    const brands = new MemoryBrandsRepo([brand("a", true), brand("b", false), brand("c", true)]);
    const out = await scanAllActive(brands, { wp, articles: new MemoryArticlesRepo() });
    expect(out.map((s) => s.brandId)).toEqual(["a", "c"]);
  });

  it("isolates a failing brand so the rest still scan", async () => {
    const boom: WordPressClient = {
      async fetchRecentPosts(b) { if (b.id === "a") throw new Error("nope"); return []; },
    };
    const brands = new MemoryBrandsRepo([brand("a", true), brand("c", true)]);
    const out = await scanAllActive(brands, { wp: boom, articles: new MemoryArticlesRepo() });
    expect(out.map((s) => s.brandId)).toEqual(["c"]);
  });
});
