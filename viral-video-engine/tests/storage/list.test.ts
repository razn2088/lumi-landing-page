import { describe, it, expect } from "vitest";
import { MemoryStorage } from "../../src/storage/memory.js";

describe("StorageClient.list", () => {
  it("lists entries under a prefix with filename + url", async () => {
    const s = new MemoryStorage();
    await s.upload("music/topdealsus/a.mp3", new Uint8Array([1]), "audio/mpeg");
    await s.upload("music/topdealsus/b.mp3", new Uint8Array([2]), "audio/mpeg");
    await s.upload("music/other/c.mp3", new Uint8Array([3]), "audio/mpeg");

    const entries = await s.list("music/topdealsus/");
    expect(entries.map((e) => e.name).sort()).toEqual(["a.mp3", "b.mp3"]);
    expect(entries.find((e) => e.name === "a.mp3")!.url).toBe("https://memory.storage/music/topdealsus/a.mp3");
  });

  it("returns [] for an empty prefix", async () => {
    const s = new MemoryStorage();
    expect(await s.list("music/none/")).toEqual([]);
  });
});
