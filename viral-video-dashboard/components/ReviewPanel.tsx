import type { DashboardPost } from "../lib/types";
import { VideoPlayer } from "./VideoPlayer";
import { approvePost, rejectPost } from "../lib/actions";

export function ReviewPanel({ post }: { post: DashboardPost | null }) {
  if (!post) return <div style={{ padding: 24, color: "#889" }}>Select a video from the list.</div>;
  const pending = post.status === "rendered";
  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      <VideoPlayer src={post.videoUrl} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{post.script?.hook}</div>
        <div style={{ fontSize: 12, color: "#778", marginBottom: 14 }}>{post.brandName} · {post.brandHandle}</div>
        <ol style={{ margin: "0 0 14px", paddingLeft: 18, color: "#334", fontSize: 14, lineHeight: 1.5 }}>
          {(post.script?.beats ?? []).map((b, i) => <li key={i}>{b.voiceover}</li>)}
        </ol>
        <div style={{ fontWeight: 700, fontSize: 12, color: "#556" }}>CTA</div>
        <div style={{ fontSize: 14, marginBottom: 14 }}>{post.script?.cta}</div>
        <div style={{ fontWeight: 700, fontSize: 12, color: "#556" }}>Caption</div>
        <div style={{ fontSize: 14, marginBottom: 10, whiteSpace: "pre-wrap" }}>{post.caption}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {post.hashtags.map((h) => <span key={h} style={{ background: "#eef1f5", color: "#445", fontSize: 12, padding: "3px 9px", borderRadius: 12 }}>{h}</span>)}
        </div>
        {pending ? (
          <div style={{ display: "flex", gap: 10 }}>
            <form action={approvePost.bind(null, post.id)}><button style={{ background: "#1eb980", color: "#fff", border: 0, borderRadius: 8, padding: "11px 26px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Approve</button></form>
            <form action={rejectPost.bind(null, post.id)}><button style={{ background: "#e5484d", color: "#fff", border: 0, borderRadius: 8, padding: "11px 26px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Reject</button></form>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#778", fontWeight: 600 }}>Status: {post.status}</div>
        )}
      </div>
    </div>
  );
}
