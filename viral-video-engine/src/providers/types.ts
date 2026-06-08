export interface LLMRequest {
  system: string;
  prompt: string;
  maxTokens?: number;
  cacheKey?: string;
}

export interface LLMResult {
  text: string;
}

export interface LLMProvider {
  readonly key: string;
  generate(req: LLMRequest): Promise<LLMResult>;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
}
export interface WordTimingResult {
  word: string;
  startMs: number;
}
export interface TTSResult {
  audio: Uint8Array;
  durationMs: number;
  ext: "wav" | "mp3";
  wordTimings: WordTimingResult[];
}
export interface TTSProvider {
  readonly key: string;
  synthesize(req: TTSRequest): Promise<TTSResult>;
}

export interface StockProvider {
  readonly key: string;
  /** Returns a portrait video clip URL for the given keywords, or null if none found. */
  searchClip(keywords: string[]): Promise<string | null>;
}

export interface MusicFileMeta {
  id: string;
  name: string;
}

/** Minimal structural subset of the googleapis drive_v3 client we use (keeps tests free of googleapis). */
export interface DriveLike {
  files: {
    list(params: unknown): Promise<{ data: { files?: Array<{ id?: string | null; name?: string | null }> } }>;
    get(params: unknown, opts: unknown): Promise<{ data: unknown }>;
  };
}

export interface MusicSource {
  readonly key: string;
  listFiles(folderId: string): Promise<MusicFileMeta[]>;
  download(fileId: string): Promise<Uint8Array>;
}

export interface PublishRequest {
  videoUrl: string;
  caption: string;
  igUserId: string;
  accessToken: string;
}
export interface PublishResult {
  mediaId: string;
  permalink: string;
}
export interface Publisher {
  readonly key: string;
  publish(req: PublishRequest): Promise<PublishResult>;
}
