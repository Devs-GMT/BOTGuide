import { ImageResponse } from "next/og";

export const alt = "BOTGuide: ask anything about building on BOT Chain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: 96 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="140" height="140" viewBox="0 0 64 64" fill="none"><path d="M32 21V12" stroke="#fff" strokeWidth="4" strokeLinecap="round"/><circle cx="32" cy="9" r="5.5" fill="#2fdba6"/><rect x="4" y="31" width="6" height="12" rx="3" fill="#fff"/><rect x="54" y="31" width="6" height="12" rx="3" fill="#fff"/><rect x="10" y="21" width="44" height="32" rx="14" fill="#fff"/><path d="M15 50 13 61 27 52Z" fill="#fff"/><rect x="21" y="31" width="7" height="11" rx="3.5" fill="#0a0a0a"/><rect x="36" y="31" width="7" height="11" rx="3.5" fill="#0a0a0a"/><path d="M27 46.5q5 3 10 0" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" fill="none"/></svg>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 600, letterSpacing: -3 }}>BOT<span style={{ color: "#2fdba6" }}>Guide</span></div>
        </div>
        <div style={{ marginTop: 40, fontSize: 42, color: "#a1a1a1", lineHeight: 1.3 }}>
          Ask anything about building on BOT Chain. Answers from the official docs, with sources.
        </div>
        <div style={{ marginTop: 48, fontSize: 26, color: "#6b6b6b" }}>Community project, not official BOT Chain documentation</div>
      </div>
    ),
    size,
  );
}
