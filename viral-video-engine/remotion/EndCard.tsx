import type { FC } from "react";
import { AbsoluteFill, Img } from "remotion";

export const EndCard: FC<{ brandName: string; siteUrl: string; logoUrl: string | null; brandColor: string }> = ({ brandName, siteUrl, logoUrl, brandColor }) => {
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #1d2b4d, #0f1830 70%)", justifyContent: "center", alignItems: "center", gap: 38 }}>
      {logoUrl ? (
        <Img src={logoUrl} style={{ width: 220, height: 220, objectFit: "contain" }} />
      ) : (
        <div style={{ width: 168, height: 168, borderRadius: 38, backgroundColor: brandColor, color: "#111", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 900, fontSize: 104, display: "flex", alignItems: "center", justifyContent: "center" }}>{brandName.charAt(0)}</div>
      )}
      <div style={{ color: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 800, fontSize: 52, letterSpacing: 2 }}>{brandName}</div>
      <div style={{ color: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 900, fontSize: 56, textAlign: "center", lineHeight: 1.22 }}>
        Honest reviews +<br />real comparisons
      </div>
      <div style={{ color: brandColor, fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 900, fontSize: 46 }}>{host}</div>
      <div style={{ marginTop: 6, backgroundColor: "rgba(255,255,255,0.14)", color: "#fff", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, fontSize: 38, padding: "14px 34px", borderRadius: 40 }}>tap the link in bio</div>
    </AbsoluteFill>
  );
};
