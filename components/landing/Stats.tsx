"use client";

import { BLOCK_TIME_SECONDS, MAINNET } from "@/lib/config";
import { formatBlock, useLiveBlock } from "@/lib/hooks";
import Reveal from "../Reveal";

export default function Stats() {
  const { block, error } = useLiveBlock();
  const stats = [
    {
      value: block === null ? "—" : `#${formatBlock(block)}`,
      caption: error && block === null ? "Live block height (RPC not responding)" : "Live block height on mainnet",
    },
    { value: String(MAINNET.chainId), caption: "Mainnet chain ID" },
    { value: `${BLOCK_TIME_SECONDS}s`, caption: "Block time, per botchain.ai" },
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
