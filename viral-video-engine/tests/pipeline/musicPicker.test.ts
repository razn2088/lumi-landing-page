import { describe, it, expect } from "vitest";
import { pickTrack, pickBrandTrack } from "../../src/pipeline/musicPicker.js";
import { MemoryStorage } from "../../src/storage/memory.js";

const tracks = [
  { name: "a.mp3", url: "https://s/a.mp3" },
  { name: "b.mp3", url: "https://s/b.mp3" },
  { name: "c.mp3", url: "https://s/c.mp3" },
];

describe("pickTrack", () => {
  it("is deterministic for the same seed and within range", () => {
    const a = pickTrack(tracks, "post-123");
    const b = pickTrack(tracks, "post-123");
    expect(a).toEqual(b);
    expect(tracks).toContainEqual(a);
  });
  it("returns null for an empty pool", () => {
    expect(pickTrack([], "x")).toBeNull();
  });
});

describe("pickBrandTrack", () => {
  it("lists the brand folder and returns a url, or null when empty", async () => {
    const storage = new MemoryStorage();
    expect(await pickBrandTrack(storage, "topdealsus", "seed")).toBeNull();
    await storage.upload("music/topdealsus/a.mp3", new Uint8Array([1]), "audio/mpeg");
    expect(await pickBrandTrack(storage, "topdealsus", "seed")).toBe("https://memory.storage/music/topdealsus/a.mp3");
  });
});
