import "server-only";
import { createDataClient } from "./supabase/data";

export function parseSelectedIds(formData: FormData): string[] {
  return formData.getAll("articleId").map((v) => String(v)).filter(Boolean);
}

/** Enqueues (or resets) a generate job per article so the worker re-makes the video. */
export async function enqueueGenerateJobs(articleIds: string[]): Promise<void> {
  if (articleIds.length === 0) return;
  const sb = createDataClient();
  const rows = articleIds.map((id) => ({ type: "generate", idempotency_key: `generate:${id}`, payload: { articleId: id }, status: "queued", attempts: 0, run_after: new Date().toISOString() }));
  const { error } = await sb.from("jobs").upsert(rows, { onConflict: "idempotency_key" });
  if (error) throw error;
}

/** Sets a post's publish schedule + marks it approved. publishAtIso null = publish ASAP. */
export async function setApproval(postId: string, publishAtIso: string | null): Promise<void> {
  const sb = createDataClient();
  const { error } = await sb.from("posts").update({ status: "approved", publish_at: publishAtIso }).eq("id", postId);
  if (error) throw error;
}
