"use client";

import { BLOCK_TIME_SECONDS } from "@/lib/config";
import { formatBlock, useLiveBlock } from "@/lib/hooks";

const CELLS = 16;

/** A strip that lights one cell per block time, with the live mainnet block height beside it. */
export default function BlockPulse() {
  const { block } = useLiveBlock();
  const cycle = CELLS * BLOCK_TIME_SECONDS;
  return (
    <div className="mx-auto mt-10 flex items-center justify-center gap-4 text-[12.5px] text-muted" aria-label={`A new block about every ${BLOCK_TIME_SECONDS} seconds`}>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: CELLS }, (_, i) => (
          <span
            key={i}
            className="size-2 rounded-[2px] bg-[#2a2a2a]"
            style={{ animation: `block-tick ${cycle}s linear ${i * BLOCK_TIME_SECONDS}s infinite` }}
          />
        ))}
      </div>
      <span className="font-mono">{block === null ? "BOT Chain" : `Block #${formatBlock(block)}`}</span>
    </div>
  );
}
