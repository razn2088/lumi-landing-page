export interface StorageClient {
  /** Uploads bytes at `path` and returns a fetchable URL. */
  upload(path: string, bytes: Uint8Array, contentType: string): Promise<string>;
}
