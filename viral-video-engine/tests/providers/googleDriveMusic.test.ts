import { describe, it, expect } from "vitest";
import { GoogleDriveMusicSource } from "../../src/providers/music/googleDrive.js";
import type { DriveLike } from "../../src/providers/types.js";

const fakeDrive: DriveLike = {
  files: {
    list: async () => ({ data: { files: [{ id: "1", name: "track.mp3" }, { id: null, name: null }] } }),
    get: async () => ({ data: new Uint8Array([5, 6, 7]).buffer }),
  },
};

describe("GoogleDriveMusicSource", () => {
  it("lists files, dropping entries without id/name", async () => {
    const src = new GoogleDriveMusicSource(fakeDrive);
    expect(await src.listFiles("folder")).toEqual([{ id: "1", name: "track.mp3" }]);
  });

  it("downloads bytes from an arraybuffer response", async () => {
    const src = new GoogleDriveMusicSource(fakeDrive);
    expect(await src.download("1")).toEqual(new Uint8Array([5, 6, 7]));
  });
});
