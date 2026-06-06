import { describe, it, expect } from "vitest";
import { syncBrandMusic, contentTypeForAudio } from "../../src/pipeline/musicSync.js";
import { FakeMusicSource } from "../../src/providers/music/fake.js";
import { MemoryStorage } from "../../src/storage/memory.js";
import { BrandSchema, type Brand } from "../../src/types/domain.js";

function brand(overrides: Partial<Brand> = {}): Brand {
  return BrandSchema.parse({
    id: "topdealsus", name: "Top Deals US", siteUrl: "https://topdealsus.com",
    wpApiBase: "https://topdealsus.com/wp-json/wp/v2", musicDriveFolderId: "folderA", ...overrides,
  });
}

describe("contentTypeForAudio", () => {
  it("maps known extensions and defaults to audio/mpeg", () => {
    expect(contentTypeForAudio("a.mp3")).toBe("audio/mpeg");
    expect(contentTypeForAudio("a.wav")).toBe("audio/wav");
    expect(contentTypeForAudio("a.m4a")).toBe("audio/mp4");
    expect(contentTypeForAudio("a.weird")).toBe("audio/mpeg");
  });
});

describe("syncBrandMusic", () => {
  it("uploads new tracks and skips already-cached ones", async () => {
    const source = new FakeMusicSource({ folderA: [
      { id: "1", name: "a.mp3", bytes: new Uint8Array([1]) },
      { id: "2", name: "b.mp3", bytes: new Uint8Array([2]) },
    ]});
    const storage = new MemoryStorage();
    await storage.upload("music/topdealsus/a.mp3", new Uint8Array([9]), "audio/mpeg"); // pre-existing

    const result = await syncBrandMusic(brand(), source, storage);
    expect(result.uploaded).toEqual(["b.mp3"]);
    expect(result.skipped).toEqual(["a.mp3"]);
    expect((await storage.list("music/topdealsus/")).map((e) => e.name).sort()).toEqual(["a.mp3", "b.mp3"]);
  });

  it("no-ops when the brand has no music folder", async () => {
    const result = await syncBrandMusic(brand({ musicDriveFolderId: null }), new FakeMusicSource({}), new MemoryStorage());
    expect(result).toEqual({ uploaded: [], skipped: [] });
  });
});
