export function VideoPlayer({ src }: { src: string | null }) {
  if (!src) return <div style={{ aspectRatio: "9/16", width: 270, background: "#222", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#889" }}>No video</div>;
  return <video src={src} controls style={{ width: 270, aspectRatio: "9/16", borderRadius: 10, background: "#000" }} />;
}
