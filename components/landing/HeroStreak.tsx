import type { CSSProperties } from "react";

type Stroke = { left: string; top: string; width: string; angle: number; thick: number; faint: number; peak: number; dur: number; delay: number };

// Two parallel strokes: a long main one and a shorter, dimmer one that runs on its own timing.
const STROKES: Stroke[] = [
  { left: "-20%", top: "58%", width: "140%", angle: -22, thick: 2, faint: 0.14, peak: 1, dur: 9, delay: 1.2 },
  { left: "22%", top: "86%", width: "70%", angle: -22, thick: 1, faint: 0.08, peak: 0.6, dur: 12, delay: 5 },
];

function line(s: Stroke): CSSProperties {
  return {
    position: "absolute",
    left: s.left,
    top: s.top,
    width: s.width,
    transform: `rotate(${s.angle}deg)`,
    transformOrigin: "50% 50%",
    backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(125,211,252,0) 44%, rgba(165,226,255,${s.peak}) 50%, rgba(125,211,252,0) 56%, transparent 100%), linear-gradient(90deg, transparent 8%, rgba(125,211,252,${s.faint}) 50%, transparent 92%)`,
    backgroundSize: "300% 100%, 100% 100%",
    backgroundRepeat: "no-repeat",
    animation: `streak-run ${s.dur}s cubic-bezier(0.4, 0, 0.2, 1) ${s.delay}s infinite`,
  };
}

/** Slanted strokes of light across the hero. A faint line is always there; a bright point runs along it now and then. */
export default function HeroStreak() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {STROKES.map((s, i) => (
        <div key={i}>
          <div style={{ ...line(s), height: s.thick * 7, marginTop: -s.thick * 3, filter: "blur(9px)", opacity: 0.7 }} />
          <div style={{ ...line(s), height: s.thick }} />
        </div>
      ))}
      {/* vignette: the edges fall off so the eye stays on the headline */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(75% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
    </div>
  );
}
