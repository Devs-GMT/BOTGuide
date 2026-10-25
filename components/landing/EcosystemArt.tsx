"use client";

import { useSyncExternalStore } from "react";
import { BLOCK_TIME_SECONDS, MAINNET } from "@/lib/config";
import { formatBlock } from "@/lib/hooks";

/*
 * Small stand-ins for each tool. They are drawn in the site's own style but follow the real pages
 * (labels and fields as they appear on faucet.botchain.ai, dex.botchain.ai, bridge.botchain.ai and the
 * Ecosystem Support Program page). The Explorer card shows real blocks from the mainnet RPC.
 * The wallet and staking cards are illustrations.
 */

const frame = "absolute inset-0 flex flex-col justify-center gap-2 p-5";
const chip = "rounded-lg bg-white/[0.045] ring-1 ring-white/[0.07]";
const button = "rounded-full bg-[rgb(var(--tone))] py-2 text-center text-[12.5px] font-medium text-[#0a0a0a] transition-transform duration-300 group-hover:-translate-y-0.5";

const iconProps = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Glyph({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d={d} {...iconProps} />
    </svg>
  );
}

const CUBE = "M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4L12 2.8ZM4.3 7.6 12 12l7.7-4.4M12 12v9";

function Token({ filled, label, sub }: { filled?: boolean; label: string; sub?: string }) {
  return (
    <span className={`flex items-center gap-2 rounded-full bg-white/[0.07] py-1 pl-1 pr-2.5 text-[12px] ${filled ? "" : "text-white/80"}`}>
      <span className={`size-5 shrink-0 rounded-full ${filled ? "bg-gradient-to-br from-[rgb(var(--tone))] to-[rgb(var(--tone)/0.45)]" : "bg-white/25"}`} />
      <span className="leading-[1.1]">
        {label}
        {sub && <span className="block text-[9px] text-white/40">{sub}</span>}
      </span>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden className="text-white/40">
        <path d="m2 3.5 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ---------- Explorer: the three latest mainnet blocks, straight from the RPC ---------- */

type Blk = { number: number; txs: number; gasUsed: number; ts: number };

const blockCache = new Map<number, Blk>();
let recent: Blk[] = [];
const blockListeners = new Set<() => void>();
let blockTimer: ReturnType<typeof setInterval> | null = null;
const noBlocks: Blk[] = [];

type RawBlock = { number: string; transactions: unknown[]; gasUsed: string; timestamp: string };

function toBlk(r: RawBlock): Blk {
  return { number: parseInt(r.number, 16), txs: r.transactions.length, gasUsed: parseInt(r.gasUsed, 16), ts: parseInt(r.timestamp, 16) };
}

async function rpcBatch(calls: { method: string; params: unknown[] }[]): Promise<(RawBlock | null)[]> {
  const res = await fetch(MAINNET.rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(calls.map((c, i) => ({ jsonrpc: "2.0", id: i, ...c }))),
  });
  const j = (await res.json()) as { id: number; result?: RawBlock | null }[];
  return j.sort((a, b) => a.id - b.id).map((x) => x.result ?? null);
}

async function pollBlocks() {
  try {
    const [latest] = await rpcBatch([{ method: "eth_getBlockByNumber", params: ["latest", false] }]);
    if (!latest) return;
    const head = toBlk(latest);
    blockCache.set(head.number, head);
    const missing = [head.number - 1, head.number - 2].filter((n) => !blockCache.has(n));
    if (missing.length) {
      const got = await rpcBatch(missing.map((n) => ({ method: "eth_getBlockByNumber", params: ["0x" + n.toString(16), false] })));
      got.forEach((g) => g && blockCache.set(parseInt(g.number, 16), toBlk(g)));
    }
    recent = [head.number, head.number - 1, head.number - 2].map((n) => blockCache.get(n)).filter((b): b is Blk => !!b);
    for (const k of blockCache.keys()) if (k < head.number - 8) blockCache.delete(k);
    blockListeners.forEach((l) => l());
  } catch {
    /* keep showing the last blocks */
  }
}

function subscribeBlocks(cb: () => void) {
  blockListeners.add(cb);
  if (blockListeners.size === 1) {
    pollBlocks();
    blockTimer = setInterval(pollBlocks, 3000);
  }
  return () => {
    blockListeners.delete(cb);
    if (blockListeners.size === 0 && blockTimer) {
      clearInterval(blockTimer);
      blockTimer = null;
    }
  };
}

function useRecentBlocks() {
  return useSyncExternalStore(subscribeBlocks, () => recent, () => noBlocks);
}

export function ArtExplorer() {
  const blocks = useRecentBlocks();
  const rows: (Blk | null)[] = [0, 1, 2].map((i) => blocks[i] ?? null);
  return (
    <div className={frame}>
      <div className="flex items-center justify-between px-1 text-[11px] text-white/45">
        <span className="font-mono tracking-wide">LATEST BLOCKS</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-[rgb(var(--tone))]" /> live
        </span>
      </div>
      {/* fills once per block time, then starts over with the next block */}
      <div className="h-[2px] overflow-hidden rounded-full bg-white/[0.07]">
        <span className="block h-full origin-left rounded-full bg-[rgb(var(--tone))]" style={{ animation: `art-next ${BLOCK_TIME_SECONDS}s linear infinite` }} />
      </div>
      {rows.map((b, i) => (
        <div
          key={b ? b.number : `empty-${i}`}
          className={`${chip} flex items-center justify-between px-3 py-2 transition-transform duration-500 ease-out group-hover:translate-x-1 ${i === 0 ? "!bg-[rgb(var(--tone)/0.1)] !ring-[rgb(var(--tone)/0.3)]" : ""}`}
          style={{ opacity: 1 - i * 0.2, transitionDelay: `${i * 40}ms` }}
        >
          <span className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center rounded-md bg-white/[0.07] text-[rgb(var(--tone))]">
              <Glyph d={CUBE} size={13} />
            </span>
            <span className="font-mono text-[12.5px] text-white/90">{b ? `#${formatBlock(b.number)}` : "#—"}</span>
          </span>
          <span className={`font-mono text-[11px] ${i === 0 ? "text-[rgb(var(--tone))]" : "text-white/40"}`}>
            {b ? `${b.txs} ${b.txs === 1 ? "tx" : "txs"} · ${b.gasUsed < 500 ? "0" : Math.round(b.gasUsed / 1000) + "k"} gas` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Faucet: the real claim form ---------- */

export function ArtFaucet() {
  return (
    <div className={frame}>
      <p className="px-0.5 text-[10.5px] text-white/50">Receive up to 10 BOT every 24 hours</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[rgb(var(--tone)/0.1)] p-2.5 ring-1 ring-[rgb(var(--tone)/0.45)]">
          <span className="flex items-center gap-1.5 text-[12px] text-white/90">
            <span className="size-4 rounded-full bg-gradient-to-br from-[rgb(var(--tone))] to-[rgb(var(--tone)/0.45)]" />
            Test BOT
          </span>
          <span className="mt-0.5 block text-[9.5px] text-white/45">Gas test token</span>
        </div>
        <div className={`${chip} p-2.5`}>
          <span className="flex items-center gap-1.5 text-[12px] text-white/70">
            <span className="size-4 rounded-full bg-white/25" />
            Test USDT
          </span>
          <span className="mt-0.5 block text-[9.5px] text-white/40">Stablecoin test token</span>
        </div>
      </div>
      <div className={`${chip} flex items-center px-3 py-2.5 font-mono text-[12px] text-white/35`}>
        0x…
        <span className="ml-0.5 h-3.5 w-px animate-pulse bg-[rgb(var(--tone))]" />
      </div>
      <span className={button}>Claim test BOT</span>
    </div>
  );
}

/* ---------- BDex: the swap box ---------- */

export function ArtSwap() {
  return (
    <div className={frame}>
      <div className={`${chip} px-3 py-2`}>
        <p className="text-[10.5px] text-white/45">Sell</p>
        <div className="mt-1 flex items-center justify-between">
          <Token filled label="BOT" sub="BOT" />
          <p className="font-mono text-[19px] text-white/35">0.0</p>
        </div>
      </div>
      <div className="relative -my-3 grid place-items-center">
        <span className="z-10 grid size-7 place-items-center rounded-full bg-[#1c1c1c] text-[rgb(var(--tone))] ring-1 ring-white/15 transition-transform duration-500 group-hover:rotate-180">
          <Glyph d="M8 4v14m0 0-3-3m3 3 3-3M16 20V6m0 0-3 3m3-3 3 3" size={13} />
        </span>
      </div>
      <div className={`${chip} px-3 py-2`}>
        <p className="text-[10.5px] text-white/45">Buy</p>
        <div className="mt-1 flex items-center justify-between">
          <Token label="USDT" sub="Tether USD" />
          <p className="font-mono text-[19px] text-white/35">0.0</p>
        </div>
      </div>
      <span className={button}>Connect wallet</span>
    </div>
  );
}

/* ---------- Bo Wallet (illustration) ---------- */

export function ArtWallet() {
  return (
    <div className={frame}>
      <div className="rounded-xl bg-gradient-to-br from-[rgb(var(--tone)/0.22)] via-white/[0.05] to-white/[0.03] p-4 ring-1 ring-white/[0.1]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span className="size-8 rounded-full bg-gradient-to-br from-[rgb(var(--tone))] to-[rgb(var(--tone)/0.3)]" />
            <span>
              <span className="block font-mono text-[12.5px] text-white/90">0xA1b2…9F</span>
              <span className="block text-[10.5px] text-white/45">Account 1</span>
            </span>
          </span>
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10.5px] text-white/75 ring-1 ring-white/10">BOT Chain</span>
        </div>
        <p className="mt-4 text-[10.5px] text-white/45">Balance</p>
        <p className="font-mono text-[24px] font-light leading-8 tracking-tight text-white">
          24.80 <span className="text-[13px] text-white/50">BOT</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          ["Send", "M7 17 17 7m0 0H8m9 0v9"],
          ["Receive", "M17 7 7 17m0 0h9m-9 0V8"],
        ].map(([l, d], i) => (
          <span
            key={l}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-[12px] transition-transform duration-300 group-hover:-translate-y-0.5 ${i === 0 ? "bg-[rgb(var(--tone))] font-medium text-[#0a0a0a]" : "bg-white/[0.07] text-white/80"}`}
          >
            <Glyph d={d} size={12} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Bridge: pay on BNB Chain, receive on BOT Chain ---------- */

export function ArtBridge() {
  return (
    <div className={frame}>
      <div className={`${chip} flex items-center justify-between px-3.5 py-2.5`}>
        <span className="flex items-center gap-2 text-[12px]">
          <span className="grid size-6 place-items-center rounded-full bg-[#26a17b] text-[11px] font-semibold text-white">₮</span>
          <span>
            <span className="block leading-4 text-white/90">USDT</span>
            <span className="block text-[10px] leading-3 text-white/40">BNB Chain</span>
          </span>
        </span>
        <span className="font-mono text-[17px] text-white/90">100.00</span>
      </div>
      <span className="z-10 -my-4 mx-auto grid size-7 place-items-center rounded-full bg-[#1c1c1c] text-[12px] text-[rgb(var(--tone))] ring-1 ring-white/15 transition-transform duration-500 group-hover:translate-y-0.5">↓</span>
      <div className={`${chip} flex items-center justify-between px-3.5 py-2.5`}>
        <span className="flex items-center gap-2 text-[12px]">
          <span className="grid size-6 place-items-center rounded-full bg-[rgb(var(--tone))] text-[11px] font-semibold text-[#0a0a0a]">B</span>
          <span>
            <span className="block leading-4 text-white/90">USDT</span>
            <span className="block text-[10px] leading-3 text-white/40">BOT Chain</span>
          </span>
        </span>
        <span className="font-mono text-[17px] text-white/35">—</span>
      </div>
      <div className="flex items-center gap-1.5 pt-0.5">
        {["25%", "50%", "75%", "100%"].map((p, i) => (
          <span
            key={p}
            className={`flex-1 rounded-full py-1 text-center text-[10.5px] transition-colors duration-300 ${i === 1 ? "bg-[rgb(var(--tone)/0.2)] text-[rgb(var(--tone))]" : "bg-white/[0.06] text-white/55"}`}
          >
            {p}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between px-1 text-[10.5px] text-white/45">
        <span>Bridge fee 0 USDT</span>
        <span>Estimated ≈ 7 min</span>
      </div>
    </div>
  );
}

/* ---------- Staking (illustration) ---------- */

export function ArtStaking() {
  return (
    <div className={frame}>
      <div className={`${chip} flex items-center justify-between px-3.5 py-3`}>
        <div>
          <p className="text-[10.5px] text-white/40">Amount</p>
          <p className="mt-0.5 font-mono text-[20px] text-white/90">100.00</p>
        </div>
        <Token filled label="BOT" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className={`${chip} px-3 py-2`}>
          <p className="text-[10px] text-white/40">Staked</p>
          <p className="font-mono text-[13px] text-white/85">0.00</p>
        </div>
        <div className={`${chip} px-3 py-2`}>
          <p className="text-[10px] text-white/40">Rewards</p>
          <p className="font-mono text-[13px] text-[rgb(var(--tone))]">+ 0.00</p>
        </div>
      </div>
      <span className={`${button} !py-2.5 !text-[13px]`}>Stake</span>
    </div>
  );
}

/* ---------- Ecosystem Support Program: the four real steps ---------- */

const STEPS = ["Submit Application", "Preliminary Review", "Technical Coordination", "Contract Signing"];

export function ArtSupport() {
  return (
    <div className={frame}>
      <div className="relative flex flex-col gap-2">
        <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-px bg-white/10" />
        {STEPS.map((s, i) => (
          <div key={s} className={`relative flex items-center gap-3 rounded-lg px-1 py-0.5 ${i === 0 ? "" : "opacity-70"}`} style={{ opacity: i === 0 ? 1 : 0.8 - i * 0.12 }}>
            <span
              className={`z-10 grid size-[23px] shrink-0 place-items-center rounded-full font-mono text-[10.5px] ${i === 0 ? "bg-[rgb(var(--tone))] text-[#0a0a0a]" : "bg-[#1c1c1c] text-white/55 ring-1 ring-white/15"}`}
            >
              {i + 1}
            </span>
            <span className={`text-[12.5px] ${i === 0 ? "text-white" : "text-white/65"}`}>{s}</span>
          </div>
        ))}
      </div>
      <span className={`${button} mt-1`}>Apply Now</span>
    </div>
  );
}

/* ---------- All tools ---------- */

export function ArtAll() {
  const tiles = ["30 214 165", "74 222 128", "59 110 255", "255 122 42", "96 165 250", "240 205 120"];
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="grid grid-cols-3 gap-2.5">
        {tiles.map((t, i) => (
          <span
            key={t}
            className="grid size-[58px] place-items-center rounded-xl bg-white/[0.045] ring-1 ring-white/[0.07] transition-transform duration-300 ease-out group-hover:-translate-y-1"
            style={{ transitionDelay: `${i * 35}ms` }}
          >
            <span className="size-3 rounded-full" style={{ background: `rgb(${t})`, boxShadow: `0 0 12px rgb(${t} / 0.6)` }} />
          </span>
        ))}
      </div>
    </div>
  );
}
