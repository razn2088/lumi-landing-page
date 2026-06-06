import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageClient } from "./types.js";

export class SupabaseStorageClient implements StorageClient {
  constructor(private sb: SupabaseClient, private bucket: string) {}
  async upload(path: string, bytes: Uint8Array, contentType: string): Promise<string> {
    const { error } = await this.sb.storage.from(this.bucket).upload(path, bytes, { contentType, upsert: true });
    if (error) throw error;
    const { data } = this.sb.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
