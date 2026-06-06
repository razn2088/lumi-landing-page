import { google } from "googleapis";
import type { DriveLike, MusicFileMeta, MusicSource } from "../types.js";

export class GoogleDriveMusicSource implements MusicSource {
  readonly key = "google_drive";
  constructor(private drive: DriveLike) {}

  async listFiles(folderId: string): Promise<MusicFileMeta[]> {
    const res = await this.drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'audio' and trashed = false`,
      fields: "files(id,name)",
      pageSize: 1000,
    });
    return (res.data.files ?? [])
      .filter((f): f is { id: string; name: string } => Boolean(f.id) && Boolean(f.name))
      .map((f) => ({ id: f.id, name: f.name }));
  }

  async download(fileId: string): Promise<Uint8Array> {
    const res = await this.drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" });
    return new Uint8Array(res.data as ArrayBuffer);
  }
}

/** Builds a real Drive-backed source from a service-account key file. */
export function createGoogleDriveMusicSource(keyFile: string): GoogleDriveMusicSource {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  const drive = google.drive({ version: "v3", auth }) as unknown as DriveLike;
  return new GoogleDriveMusicSource(drive);
}
