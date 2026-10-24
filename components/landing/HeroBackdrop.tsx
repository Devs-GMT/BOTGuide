"use client";

import { useEffect, useRef } from "react";
import { BLOCK_TIME_SECONDS } from "@/lib/config";
import { useReducedMotion } from "@/lib/hooks";

type Node = { id: string; label: string; x: number; y: number };

// Doc sections laid out like a route map around the headline (x, y in % of the hero).
const NODES: Node[] = [
  { id: "wallet", label: "Wallet", x: 24, y: 13 },
  { id: "network", label: "Network", x: 8, y: 30 },
  { id: "faucet", label: "Faucet", x: 17, y: 52 },
  { id: "deploy", label: "Deploy", x: 7, y: 74 },
  { id: "tools", label: "Tools", x: 74, y: 12 },
  { id: "hardhat", label: "Hardhat", x: 91, y: 27 },
  { id: "errors", label: "Errors", x: 83, y: 52 },
  { id: "explorer", label: "Explorer", x: 93, y: 73 },
];

// Routes between sections, drawn as soft curves. Each entry: from, to, bend.
const ROUTES: [string, string, number][] = [
  ["wallet", "network", -6],
  ["network", "faucet", 5],
  ["faucet", "deploy", -6],
  ["tools", "hardhat", 6],
  ["hardhat", "errors", -5],
  ["errors", "explorer", 6],
];

// Cells that light up one after another, one per block time. Fixed so server and client render the same.
const CELLS: [number, number][] = [
  [14, 20], [31, 8], [3, 44], [27, 66], [12, 88], [40, 30], [20, 36], [34, 82],
  [86, 12], [96, 46], [68, 28], [78, 68], [60, 8], [90, 90], [72, 84], [50, 94],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

function curve([a, b, bend]: [string, string, number]) {
  const p = byId[a];
  const q = byId[b];
  const mx = (p.x + q.x) / 2 + bend;
  const my = (p.y + q.y) / 2;
  return `M ${p.x} ${p.y} Q ${mx} ${my} ${q.x} ${q.y}`;
}

export default function HeroBackdrop() {
  const reduced = useReducedMotion();
  const glow = useRef<HTMLDivElement>(null);

  // soft orange light that follows the pointer (static with reduced motion)
  useEffect(() => {
    const el = glow.current;
    const host = el?.parentElement?.parentElement;
    if (!el || !host || reduced) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = host.getBoundingClientRect();
        el.style.setProperty("--gx", `${e.clientX - r.left}px`);
        el.style.setProperty("--gy", `${e.clientY - r.top}px`);
        el.style.opacity = "1";
      });
    };
    host.addEventListener("pointermove", onMove);
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const cycle = CELLS.length * BLOCK_TIME_SECONDS;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* dot grid, faded towards the edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 75% 70% at 50% 40%, transparent 22%, #000 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 40%, transparent 22%, #000 85%)",
          opacity: 0.55,
        }}
      />

      {/* pointer light */}
      <div
        ref={glow}
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{ background: "radial-gradient(380px circle at var(--gx, 50%) var(--gy, 30%), rgba(255,122,61,0.10), transparent 70%)" }}
      />

      {/* routes */}
      <svg className="absolute inset-0 h-full w-full max-md:opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
        {ROUTES.map((r, i) => (
          <path
            key={r.join("-")}
            d={curve(r)}
            fill="none"
            stroke="#ff7a3d"
            strokeOpacity="0.4"
            strokeWidth="1"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
            style={{ animation: `route-flow ${10 + i}s linear infinite` }}
          />
        ))}
      </svg>

      {/* sections */}
      {NODES.map((n, i) => (
        <div key={n.id} className="absolute" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <span
            className="absolute -left-[3px] -top-[3px] block size-[7px] rounded-full bg-accent"
            style={{ animation: `node-ping 4.5s ease-in-out ${i * 0.6}s infinite` }}
          />
          <span className="absolute left-3 top-[-8px] hidden whitespace-nowrap font-mono text-[11px] tracking-wide text-white/35 md:block">{n.label}</span>
        </div>
      ))}

      {/* blocks: one cell lights per block time */}
      {CELLS.map(([x, y], i) => (
        <span
          key={i}
          className="absolute size-[7px] rounded-[2px] border border-white/[0.07] bg-[#141414]"
          style={{ left: `${x}%`, top: `${y}%`, animation: `block-tick ${cycle}s linear ${i * BLOCK_TIME_SECONDS}s infinite` }}
        />
      ))}
    </div>
  );
}
