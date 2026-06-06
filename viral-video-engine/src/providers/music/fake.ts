import type { MusicFileMeta, MusicSource } from "../types.js";

interface FakeFile { id: string; name: string; bytes: Uint8Array; }

export class FakeMusicSource implements MusicSource {
  readonly key = "fake";
  constructor(private folders: Record<string, FakeFile[]>) {}
  async listFiles(folderId: string): Promise<MusicFileMeta[]> {
    return (this.folders[folderId] ?? []).map((f) => ({ id: f.id, name: f.name }));
  }
  async download(fileId: string): Promise<Uint8Array> {
    for (const files of Object.values(this.folders)) {
      const hit = files.find((f) => f.id === fileId);
      if (hit) return hit.bytes;
    }
    throw new Error(`Fake music file not found: ${fileId}`);
  }
}
