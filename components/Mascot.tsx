import type { CSSProperties } from "react";

export type Mood = "idle" | "hello" | "thinking" | "done" | "lost";

/**
 * The BOTGuide robot. The head takes the text color, the antenna light is the brand orange.
 * idle: calm blink · hello: waves its light · thinking: light pulses, eyes look around ·
 * done: light stays lit · lost: light dims, flat mouth, question mark.
 */
export default function Mascot({ mood = "idle", size = 32, className = "", style }: { mood?: Mood; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden className={`bo bo-${mood} ${className}`} style={style}>
      <path d="M32 21V12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle className="bo-glow" cx="32" cy="9" r="9" fill="#F26B3A" />
      <circle className="bo-light" cx="32" cy="9" r="5.5" fill="#F26B3A" />
      <rect x="4" y="31" width="6" height="12" rx="3" fill="currentColor" />
      <rect x="54" y="31" width="6" height="12" rx="3" fill="currentColor" />
      <rect x="10" y="21" width="44" height="32" rx="14" fill="currentColor" />
      <path d="M15 50 13 61 27 52Z" fill="currentColor" />
      <g className="bo-eyes">
        <rect className="bo-eye" x="21" y="31" width="7" height="11" rx="3.5" fill="#0a0a0a" />
        <rect className="bo-eye" x="36" y="31" width="7" height="11" rx="3.5" fill="#0a0a0a" />
      </g>
      {mood === "lost" ? (
        <path d="M27.5 47h9" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" />
      ) : mood === "thinking" ? (
        <circle cx="32" cy="47" r="2.4" fill="#0a0a0a" />
      ) : (
        <path d="M27 46.5q5 3 10 0" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      )}
      {mood === "lost" && (
        <text x="45" y="20" fontSize="14" fontWeight="600" fill="#F26B3A" fontFamily="system-ui, sans-serif">
          ?
        </text>
      )}
    </svg>
  );
}
