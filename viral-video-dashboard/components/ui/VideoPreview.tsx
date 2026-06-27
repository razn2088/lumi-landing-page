"use client";
import { useEffect, useState } from "react";

export function VideoPreview({ videoUrl, title }: { videoUrl: string; title: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="vs-btn"
        aria-label={`Play ${title}`}
        style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, padding: "7px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
      >
        ▶ Play
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(8,12,24,.66)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <video src={videoUrl} controls autoPlay style={{ width: 300, maxWidth: "86vw", aspectRatio: "9 / 16", borderRadius: 14, background: "#000", boxShadow: "0 18px 60px rgba(0,0,0,.5)" }} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.25)", borderRadius: 999, padding: "7px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
