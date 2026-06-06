import type { Brand } from "../types/domain.js";
import type { MusicSource } from "../providers/types.js";
import type { StorageClient } from "../storage/types.js";

const AUDIO_TYPES: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
};

export function contentTypeForAudio(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return AUDIO_TYPES[ext] ?? "audio/mpeg";
}

export interface SyncResult { uploaded: string[]; skipped: string[]; }

/** Mirrors a brand's Drive music folder into music/{brandId}/ in storage. Idempotent by filename. */
export async function syncBrandMusic(brand: Brand, source: MusicSource, storage: StorageClient): Promise<SyncResult> {
  if (!brand.musicDriveFolderId) return { uploaded: [], skipped: [] };
  const prefix = `music/${brand.id}/`;
  const existing = new Set((await storage.list(prefix)).map((e) => e.name));
  const files = await source.listFiles(brand.musicDriveFolderId);

  const uploaded: string[] = [];
  const skipped: string[] = [];
  for (const f of files) {
    if (existing.has(f.name)) { skipped.push(f.name); continue; }
    const bytes = await source.download(f.id);
    await storage.upload(`${prefix}${f.name}`, bytes, contentTypeForAudio(f.name));
    uploaded.push(f.name);
  }
  return { uploaded, skipped };
}
