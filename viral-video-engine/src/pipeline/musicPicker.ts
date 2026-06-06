import type { StorageClient, StorageEntry } from "../storage/types.js";

/** Deterministic pick by a string seed (e.g. the post id), so the same post always gets the same track. */
export function pickTrack(tracks: StorageEntry[], seed: string): StorageEntry | null {
  if (tracks.length === 0) return null;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  return tracks[Math.abs(h) % tracks.length] ?? null;
}

/** Lists music/{brandId}/ and returns one track's public url (or null if the pool is empty). */
export async function pickBrandTrack(storage: StorageClient, brandId: string, seed: string): Promise<string | null> {
  const tracks = await storage.list(`music/${brandId}/`);
  return pickTrack(tracks, seed)?.url ?? null;
}
