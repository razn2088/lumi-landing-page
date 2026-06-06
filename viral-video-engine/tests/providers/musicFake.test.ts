import { describe, it, expect } from "vitest";
import { FakeMusicSource } from "../../src/providers/music/fake.js";

describe("FakeMusicSource", () => {
  it("lists seeded files and downloads their bytes", async () => {
    const src = new FakeMusicSource({
      folderA: [{ id: "1", name: "a.mp3", bytes: new Uint8Array([10, 20]) }],
    });
    const files = await src.listFiles("folderA");
    expect(files).toEqual([{ id: "1", name: "a.mp3" }]);
    expect(await src.download("1")).toEqual(new Uint8Array([10, 20]));
  });

  it("returns [] for an unknown folder", async () => {
    const src = new FakeMusicSource({});
    expect(await src.listFiles("nope")).toEqual([]);
  });
});
