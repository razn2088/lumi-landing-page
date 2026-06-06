import { describe, it, expect } from "vitest";
import { MemoryStorage } from "../../src/storage/memory.js";

describe("MemoryStorage", () => {
  it("uploads bytes and returns a stable url; stores the content", async () => {
    const s = new MemoryStorage("https://cdn.test");
    const url = await s.upload("audio/post-1.wav", new Uint8Array([1, 2, 3]), "audio/wav");
    expect(url).toBe("https://cdn.test/audio/post-1.wav");
    expect(s.get("audio/post-1.wav")?.bytes.byteLength).toBe(3);
    expect(s.get("audio/post-1.wav")?.contentType).toBe("audio/wav");
  });
});
