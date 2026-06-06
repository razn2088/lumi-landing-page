import type { StorageClient } from "./types.js";

export class MemoryStorage implements StorageClient {
  private files = new Map<string, { bytes: Uint8Array; contentType: string }>();
  constructor(private baseUrl = "https://memory.storage") {}
  async upload(path: string, bytes: Uint8Array, contentType: string): Promise<string> {
    this.files.set(path, { bytes, contentType });
    return `${this.baseUrl}/${path}`;
  }
  get(path: string) {
    return this.files.get(path) ?? null;
  }
}
