"use client";

import { BLOCK_TIME_SECONDS } from "@/lib/config";
import { formatBlock, useLiveBlock } from "@/lib/hooks";

/* Small stand-ins for each tool, drawn in the site's own style. They are illustrations, not screenshots. */

const frame = "absolute inset-0 flex flex-col justify-center gap-2.5 p-5";
const chip = "rounded-lg bg-white/[0.045] ring-1 ring-white/[0.07]";

export function ArtExplorer() {
  const { block } = useLiveBlock();
  return (
    <div className={frame}>
      <div className="flex items-center justify-between px-1 text-[11px] text-white/45">
        <span className="font-mono tracking-wide">LATEST BLOCKS</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-[rgb(var(--tone))]" /> live
        </span>
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${chip} flex items-center justify-between px-3 py-2 transition-transform duration-500 ease-out group-hover:translate-x-1`}
          style={{ opacity: 1 - i * 0.25, transitionDelay: `${i * 40}ms` }}
        >
          <span className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center rounded-md bg-white/[0.07] text-[10px] text-[rgb(var(--tone))]">Bk</span>
            <span className="font-mono text-[12.5px] text-white/90">{block === null ? "#—" : `#${formatBlock(block - i)}`}</span>
          </span>
          <span className="font-mono text-[11px] text-white/40">{i === 0 ? "now" : `${(i * BLOCK_TIME_SECONDS).toFixed(2)}s ago`}</span>
        </div>
      ))}
    </div>
  );
}

export function ArtFaucet() {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative">
        <svg width="150" height="150" viewBox="0 0 120 120" className="-rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgb(var(--tone))"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * 0.28}
            className="transition-[stroke-dashoffset] duration-[1200ms] ease-out group-hover:[stroke-dashoffset:0]"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-mono text-[34px] font-light leading-none tracking-[-0.04em]">10</p>
            <p className="mt-1 text-[11px] text-white/50">tBOT</p>
          </div>
        </div>
      </div>
      <p className="absolute bottom-5 text-[11px] text-white/40">per address, every 24 hours</p>
    </div>
  );
}

export function ArtSwap() {
  return (
    <div className={frame}>
      <div className={`${chip} flex items-center justify-between px-3.5 py-3`}>
        <div>
          <p className="text-[10.5px] text-white/40">From</p>
          <p className="mt-0.5 font-mono text-[18px] text-white/90">1.00</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-white/[0.07] py-1 pl-1 pr-3 text-[12px]">
          <span className="size-5 rounded-full bg-[rgb(var(--tone))]" /> BOT
        </span>
      </div>
      <div className="relative -my-1 grid place-items-center">
        <span className="z-10 grid size-8 place-items-center rounded-full bg-[#1c1c1c] text-white/80 ring-1 ring-white/15 transition-transform duration-500 group-hover:rotate-180">⇅</span>
      </div>
      <div className={`${chip} flex items-center justify-between px-3.5 py-3`}>
        <div>
          <p className="text-[10.5px] text-white/40">To</p>
          <p className="mt-0.5 font-mono text-[18px] text-white/35">—</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-white/[0.07] py-1 pl-1 pr-3 text-[12px] text-white/70">
          <span className="size-5 rounded-full border border-white/30" /> Any token
        </span>
      </div>
    </div>
  );
}

export function ArtWallet() {
  return (
    <div className={frame}>
      <div className={`${chip} p-4`}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <span className="size-8 rounded-full bg-gradient-to-br from-[rgb(var(--tone))] to-[rgb(var(--tone)/0.3)]" />
            <span>
              <span className="block font-mono text-[12.5px] text-white/90">0xA1b2…9F</span>
              <span className="block text-[10.5px] text-white/40">Account 1</span>
            </span>
          </span>
          <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[10.5px] text-white/70">BOT Chain</span>
        </div>
        <div className="mt-4 h-2 w-24 rounded-full bg-white/15" />
        <div className="mt-2 h-2 w-16 rounded-full bg-white/[0.07]" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {["Send", "Receive"].map((l, i) => (
          <span
            key={l}
            className={`rounded-full py-2 text-center text-[12px] transition-transform duration-300 group-hover:-translate-y-0.5 ${i === 0 ? "bg-[rgb(var(--tone))] text-[#0a0a0a]" : "bg-white/[0.07] text-white/80"}`}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

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
      <div className="flex items-center gap-1.5 pt-1">
        {["25%", "50%", "75%", "100%"].map((p, i) => (
          <span
            key={p}
            className={`flex-1 rounded-full py-1 text-center text-[10.5px] transition-colors duration-300 ${i === 1 ? "bg-[rgb(var(--tone)/0.2)] text-[rgb(var(--tone))]" : "bg-white/[0.06] text-white/55"}`}
          >
            {p}
          </span>
        ))}
        <span className="ml-1 shrink-0 text-[10.5px] text-white/40">≈ 7 min</span>
      </div>
    </div>
  );
}

export function ArtStaking() {
  return (
    <div className={frame}>
      <div className={`${chip} flex items-center justify-between px-3.5 py-3`}>
        <div>
          <p className="text-[10.5px] text-white/40">Amount</p>
          <p className="mt-0.5 font-mono text-[18px] text-white/90">100.00</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-white/[0.07] py-1 pl-1 pr-3 text-[12px]">
          <span className="size-5 rounded-full bg-[rgb(var(--tone))]" /> BOT
        </span>
      </div>
      <div className="flex items-center justify-between px-1 text-[11.5px]">
        <span className="text-white/45">Rewards</span>
        <span className="font-mono text-[rgb(var(--tone))]">+ 0.00 BOT</span>
      </div>
      <span className="rounded-full bg-[rgb(var(--tone))] py-2.5 text-center text-[13px] font-medium text-[#0a0a0a] transition-transform duration-300 group-hover:-translate-y-0.5">
        Stake
      </span>
    </div>
  );
}

export function ArtSupport() {
  return (
    <div className={frame}>
      <p className="px-1 text-[11px] uppercase tracking-wide text-white/45">Application</p>
      {["Project name", "What are you building?"].map((l) => (
        <div key={l} className={`${chip} px-3.5 py-2.5`}>
          <p className="text-[10.5px] text-white/40">{l}</p>
          <div className="mt-1.5 h-2 w-3/5 rounded-full bg-white/15" />
        </div>
      ))}
      <span className="rounded-full bg-[rgb(var(--tone))] py-2.5 text-center text-[13px] font-medium text-[#0a0a0a] transition-transform duration-300 group-hover:-translate-y-0.5">
        Apply
      </span>
    </div>
  );
}

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
