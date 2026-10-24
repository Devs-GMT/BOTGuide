"use client";

import { BLOCK_TIME_SECONDS, MAINNET } from "@/lib/config";
import { formatBlock, useLiveBlock } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import Reveal from "../Reveal";

/** Counts from 0 to `to` once it scrolls into view. */
function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const reduced = useReducedMotion();
  const [ref, seen] = useInView<HTMLSpanElement>();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen || reduced) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setN(to * (1 - Math.pow(1 - t, 4)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced, to]);
  const shown = reduced || !seen ? (reduced ? to : 0) : n;
  return (
    <span ref={ref} className="tabular-nums">
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const { block, error } = useLiveBlock();
  const stats = [
    {
      value: block === null ? "—" : `#${formatBlock(block)}`,
      caption: error && block === null ? "Live block height (RPC not responding)" : "Live block height on mainnet",
    },
    { value: <CountUp to={MAINNET.chainId} />, caption: "Mainnet chain ID" },
    { value: <CountUp to={BLOCK_TIME_SECONDS} decimals={2} suffix="s" />, caption: "Block time, per botchain.ai" },
  ];
  return (
    <section className="hairline-t">
      <div className="mx-auto w-full max-w-[1280px] px-4 lg:px-6">
        <div className="grid md:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal
              key={s.caption}
              delay={i * 80}
              className={`py-12 sm:py-16 md:px-8 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : "md:pl-0"}`}
            >
              <p className="font-mono text-[clamp(2.4rem,5vw,3.75rem)] font-light leading-none tracking-[-0.04em]">
                {s.value}
              </p>
              <p className="mt-4 text-[14px] text-muted">{s.caption}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
