export interface StorageEntry {
  /** Filename within the prefix (no leading path). */
  name: string;
  /** Public, fetchable URL. */
  url: string;
}

export interface StorageClient {
  /** Uploads bytes at `path` and returns a fetchable URL. */
  upload(path: string, bytes: Uint8Array, contentType: string): Promise<string>;
  /** Lists entries directly under `prefix` (prefix ends with `/`). */
  list(prefix: string): Promise<StorageEntry[]>;
}
