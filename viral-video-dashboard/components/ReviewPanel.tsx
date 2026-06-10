import type { DashboardPost } from "../lib/types";
import { VideoPlayer } from "./VideoPlayer";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { approveWithScheduleAction, reschedulePublishAction, rejectPost } from "../lib/actions";

export function ReviewPanel({ post }: { post: DashboardPost | null }) {
  if (!post) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
        Select a video from the list.
      </div>
    );
  }
  const pending = post.status === "rendered";
  const approved = post.status === "approved";
  return (
    <div style={{ display: "flex", gap: 24, padding: 24, alignItems: "flex-start" }}>
      <div style={{ flexShrink: 0 }}>
        <VideoPlayer src={post.videoUrl} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, letterSpacing: "-0.01em" }}>{post.script?.hook}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 16 }}>
          {post.brandName} · {post.brandHandle}
        </div>

        <ol style={{ margin: "0 0 16px", paddingLeft: 18, color: "var(--text)", fontSize: 14, lineHeight: 1.55 }}>
          {(post.script?.beats ?? []).map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b.voiceover}</li>)}
        </ol>

        <Card style={{ background: "var(--surface-2)", boxShadow: "none", padding: 14, marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 6 }}>
            Caption
          </div>
          <div style={{ fontSize: 14, marginBottom: 12, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{post.caption}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {post.hashtags.map((h) => (
              <span key={h} style={{ background: "var(--surface)", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border)" }}>{h}</span>
            ))}
          </div>
        </Card>

        {pending ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <form action={approveWithScheduleAction} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input type="hidden" name="postId" value={post.id} />
              <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                Publish at
                <input type="datetime-local" name="publishAt" style={{ marginLeft: 6, padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, background: "var(--surface)", color: "var(--text)" }} />
              </label>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>(leave empty = now)</span>
              <Button variant="primary" type="submit">Approve</Button>
            </form>
            <form action={rejectPost.bind(null, post.id)}>
              <Button variant="danger" type="submit">Reject</Button>
            </form>
          </div>
        ) : approved ? (
          <div>
            <div style={{ fontSize: 13, color: "var(--accent-2)", fontWeight: 700, marginBottom: 10 }}>
              Approved · {post.publishAt ? `scheduled ${new Date(post.publishAt).toLocaleString()}` : "publishing now"}
            </div>
            <form action={reschedulePublishAction} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="datetime-local" name="publishAt" style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, background: "var(--surface)", color: "var(--text)" }} />
              <Button variant="primary" type="submit">Reschedule</Button>
              <Button variant="ghost" formAction={reschedulePublishAction} name="publishAt" value="">Publish now</Button>
            </form>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>Status: {post.status}</div>
        )}
      </div>
    </div>
  );
}
