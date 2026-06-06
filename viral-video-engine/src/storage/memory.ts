import type { StorageClient, StorageEntry } from "./types.js";

export class MemoryStorage implements StorageClient {
  private files = new Map<string, { bytes: Uint8Array; contentType: string }>();
  constructor(private baseUrl = "https://memory.storage") {}
  async upload(path: string, bytes: Uint8Array, contentType: string): Promise<string> {
    this.files.set(path, { bytes, contentType });
    return `${this.baseUrl}/${path}`;
  }
  async list(prefix: string): Promise<StorageEntry[]> {
    const out: StorageEntry[] = [];
    for (const key of this.files.keys()) {
      if (key.startsWith(prefix)) {
        const name = key.slice(prefix.length);
        if (name && !name.includes("/")) out.push({ name, url: `${this.baseUrl}/${key}` });
      }
    }
    return out;
  }
  get(path: string) {
    return this.files.get(path) ?? null;
  }
}
