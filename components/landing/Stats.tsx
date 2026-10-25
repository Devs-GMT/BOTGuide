"use client";

import { useEffect, useState } from "react";
import { BLOCK_TIME_SECONDS, DOCS_LAST_SYNCED } from "@/lib/config";
import { contractReady, fetchStats } from "@/lib/contract";
import { useInView, useReducedMotion } from "@/lib/hooks";
import kbMeta from "@/lib/kb-meta.json";
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
  const [chain, setChain] = useState<{ rated: number; tips: number } | null>(null);

  // the same counters the contract keeps (stats()); until they load, or if there is no contract, the cell shows a dash
  useEffect(() => {
    if (!contractReady) return;
    let live = true;
    fetchStats()
      .then((x) => live && setChain({ rated: x.helpful + x.notHelpful, tips: x.tipsApproved }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const stats = [
    {
      value: <CountUp to={kbMeta.pages} />,
      caption: DOCS_LAST_SYNCED ? `Doc pages in the knowledge base, synced ${DOCS_LAST_SYNCED}` : "Doc pages in the knowledge base",
    },
    { value: chain ? <CountUp to={chain.rated} /> : "—", caption: "Answers rated on BOT Chain" },
    { value: chain ? <CountUp to={chain.tips} /> : "—", caption: "Community tips approved" },
    { value: <CountUp to={BLOCK_TIME_SECONDS} decimals={2} suffix="s" />, caption: "Block time, per botchain.ai" },
  ];
  return (
    <section className="hairline-t">
      <div className="mx-auto w-full max-w-[1280px] px-4 lg:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.caption}
              delay={i * 80}
              className={`py-10 sm:py-14 lg:px-8 ${i > 0 ? "border-t border-line lg:border-l lg:border-t-0" : "lg:pl-0"} ${i === 1 ? "sm:border-l sm:border-t-0 lg:border-l" : ""} ${i === 2 ? "sm:border-t lg:border-t-0" : ""} ${i === 3 ? "sm:border-l sm:border-t lg:border-t-0" : ""}`}
            >
              <p className="font-mono text-[clamp(2.4rem,4.2vw,3.5rem)] font-light leading-none tracking-[-0.04em]">{s.value}</p>
              <p className="mt-4 max-w-[16rem] text-[14px] leading-5 text-muted">{s.caption}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
