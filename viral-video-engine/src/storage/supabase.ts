import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageClient, StorageEntry } from "./types.js";

export class SupabaseStorageClient implements StorageClient {
  constructor(private sb: SupabaseClient, private bucket: string) {}
  async upload(path: string, bytes: Uint8Array, contentType: string): Promise<string> {
    const { error } = await this.sb.storage.from(this.bucket).upload(path, bytes, { contentType, upsert: true });
    if (error) throw error;
    const { data } = this.sb.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
  async list(prefix: string): Promise<StorageEntry[]> {
    const folder = prefix.replace(/\/$/, "");
    const { data, error } = await this.sb.storage.from(this.bucket).list(folder, { limit: 1000 });
    if (error) throw error;
    return (data ?? [])
      .filter((f) => f.id !== null && f.name && !f.name.endsWith("/"))
      .map((f) => ({ name: f.name, url: this.sb.storage.from(this.bucket).getPublicUrl(`${folder}/${f.name}`).data.publicUrl }));
  }
}
