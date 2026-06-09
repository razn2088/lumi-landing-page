export type PostStatus = "rendered" | "approved" | "rejected";

export interface ScriptBeat { kind: string; voiceover: string; brollKeywords?: string[]; onScreenText?: string }
export interface Script { hook: string; beats: ScriptBeat[]; cta: string }

export interface DashboardPost {
  id: string;
  brandId: string;
  brandName: string;
  brandHandle: string;
  script: Script;
  caption: string;
  hashtags: string[];
  videoUrl: string | null;
  publishAt: string | null;
  status: string;
  createdAt: string;
}

export interface DashboardBrand {
  id: string;
  name: string;
}
