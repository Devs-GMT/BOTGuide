"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { BLOCK_TIME_SECONDS, MAINNET, TESTNET, type Network } from "@/lib/config";
import { formatBlock, useLiveBlock } from "@/lib/hooks";
import Reveal from "../Reveal";
import { Arrow, Container } from "../ui";
import { ArtBridge, ArtExplorer, ArtFaucet, ArtStaking, ArtSupport, ArtSwap, ArtWallet } from "./EcosystemArt";

/**
 * One card: a live preview that fades into the label row, name bottom-left, "Explore" bottom-right.
 * A soft light follows the pointer, and the animations pause while the card is off screen.
 */
function Card({ href, label, external, children }: { href: string; label: string; external?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const follow = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const cls =
    "bento-card group relative block h-[340px] overflow-hidden rounded-[20px] bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[background-color,transform] duration-300 ease-[var(--ease-soft)] hover:bg-card-hi active:scale-[0.985] lg:h-[360px]";
  const inner = (
    <>
      <div aria-hidden className="absolute inset-0">
        {children}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(380px circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.07), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-20 backdrop-blur-[3px]"
        style={{ WebkitMaskImage: "linear-gradient(to top, #000 45%, transparent)", maskImage: "linear-gradient(to top, #000 45%, transparent)" }}
      />
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-gradient-to-t from-card via-card/90 to-transparent px-6 pb-5 pt-12 transition-colors duration-300 group-hover:from-card-hi group-hover:via-card-hi/90">
        <span className="text-[17px] font-medium tracking-[-0.005em]">{label}</span>
        <span className="flex items-center gap-1.5 text-[16px] font-medium">
          Explore
          <Arrow className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-1" />
        </span>
      </div>
    </>
  );
  return external ? (
    <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" data-live={live} onPointerMove={follow} className={cls}>
      {inner}
    </a>
  ) : (
    <Link ref={ref} href={href} data-live={live} onPointerMove={follow} className={cls}>
      {inner}
    </Link>
  );
}

/* ---------- Ask: a chat that keeps scrolling ---------- */

const CHAT: { q: string; a: string; src: string }[] = [
  { q: "Why is my transaction failing?", a: "Usually the wrong chain or no gas. Check you are on chain ID 677 and hold BOT for fees.", src: "Common errors" },
  { q: "How do I get testnet BOT?", a: "Use the faucet: 10 tBOT every 24 hours for each wallet.", src: "Testnet faucet" },
  { q: "Hardhat config for BOT Chain?", a: "Add a network with url https://rpc.botchain.ai and chainId 677.", src: "Deploy with Hardhat" },
  { q: "How do I add BOT Chain to MetaMask?", a: "Add a custom network: chain ID 677, symbol BOT, explorer scan.botchain.ai.", src: "Network and RPC" },
];

function DocIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 1.5h4l2 2v7H3v-9Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M7 1.5v2h2" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function ChatPreview() {
  const rows = [...CHAT, ...CHAT];
  return (
    <div className="bento-fade-y absolute inset-0 overflow-hidden px-5 pt-4">
      <div className="flex flex-col gap-3.5" style={{ animation: "bento-scroll 30s linear infinite" }}>
        {rows.map((r, i) => (
          <div key={i} className="flex flex-col gap-3.5">
            <p className="max-w-[86%] self-end rounded-[18px] rounded-br-md bg-[#2c2c2c] px-4 py-2.5 text-[14px] leading-5">{r.q}</p>
            <div className="max-w-[94%] rounded-[18px] rounded-bl-md bg-[#1e1e1e] px-4 py-3 ring-1 ring-white/[0.04]">
              <p className="text-[13.5px] leading-[1.45] text-white/85">{r.a}</p>
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] py-1 pl-1 pr-2 text-[11.5px] text-white/60">
                <span className="grid h-4 min-w-4 place-items-center rounded bg-white/10 px-1 font-mono text-[10px] text-white/80">1</span>
                <DocIcon />
                {r.src}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Deploy: an agent edits the config, then deploys ---------- */

function TerminalPreview() {
  const step = (n: number) => ({ animation: `bento-t${n} 12s ease-out infinite both` });
  const num = "w-6 shrink-0 text-right text-white/30";
  const task = (name: string, kind: string, status: "done" | "running") => (
    <p className="flex items-center gap-2 whitespace-nowrap text-white/55">
      <span className="text-white/35">|</span>
      <span className="text-white/65">{name}</span>
      <span className="text-white/35">{kind}</span>
      <span className={`ml-auto ${status === "done" ? "text-[#7ee8a8]" : "text-[#7aa2ff]"}`}>[{status}]</span>
    </p>
  );
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.05] px-5 py-3.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 whitespace-nowrap font-mono text-[12.5px] text-muted">botguide/deploy</span>
        <span className="ml-auto h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-white/10 sm:w-24">
          <span className="block h-full origin-left rounded-full bg-white/90" style={{ animation: "bento-bar 12s ease-out infinite both" }} />
        </span>
      </div>
      <div className="font-mono text-[13px] leading-[22px]">
        <div style={step(1)} className="space-y-0.5 px-5 pt-3">
          {task("Read network docs", "explore", "done")}
          {task("Check chain IDs", "general", "done")}
          {task("Find hardhat config", "explore", "done")}
        </div>
        <p style={step(2)} className="mt-3 px-5">
          <span className="text-[#9aa8ff]">◆</span> <span className="font-semibold">Edit</span> <span className="text-[#7ee8a8]/90">hardhat.config.js</span>
        </p>
        <div style={step(2)} className="mt-1 flex gap-3 px-5 text-white/75">
          <span className={num}>12</span>
          <span>botMainnet: {"{"}</span>
        </div>
        <div style={step(3)}>
          <div className="flex gap-3 bg-[#3b1e22] px-5 text-[#ff8da4]">
            <span className={num}>13</span>
            <span>- chainId: 1,</span>
          </div>
          <div className="flex gap-3 bg-[#1e3b26] px-5 text-[#7ee8a8]">
            <span className={num}>14</span>
            <span>+ chainId: 677,</span>
          </div>
          <div className="flex gap-3 bg-[#1e3b26] px-5 text-[#7ee8a8]">
            <span className={num}>15</span>
            <span>+ url: &quot;https://rpc.botchain.ai&quot;,</span>
          </div>
        </div>
        <p style={step(5)} className="whitespace-nowrap px-5 pt-3 text-white">
          <span className="text-[#6ee7b7]">✦</span> Deployed. Confirmed in one block.
        </p>
        <div style={step(4)} className="mt-3 flex items-center gap-2 border-t border-white/[0.05] bg-white/[0.04] px-5 py-2.5 text-white/80">
          <span className="text-[#9aa8ff]">❯</span> Deploy to BOT Chain mainnet
        </div>
      </div>
    </div>
  );
}

/* ---------- Network: ids that swap, block cells that tick ---------- */

function NetworkFace({ net, anim }: { net: Network; anim: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center gap-3" style={{ animation: `${anim} 8s ease-in-out infinite` }}>
      <p className="font-mono text-[56px] font-light leading-[56px] tracking-tight">{net.chainId}</p>
      <div className="space-y-1 text-center text-[12.5px] text-muted">
        <p>
          RPC <span className="ml-1 font-mono text-white/75">{net.rpc.replace("https://", "")}</span>
        </p>
        <p>
          Explorer <span className="ml-1 font-mono text-white/75">{net.explorer.replace("https://", "")}</span>
        </p>
      </div>
    </div>
  );
}

function NetworkPreview() {
  const { block } = useLiveBlock();
  return (
    <div className="absolute inset-0">
      <div className="absolute left-1/2 top-5 h-9 w-[200px] -translate-x-1/2 rounded-full bg-[#1f1f1f] p-[3px] ring-1 ring-white/[0.05]">
        <span className="block h-full w-1/2 rounded-full bg-[#383838] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]" style={{ animation: "bento-seg 8s ease-in-out infinite" }} />
        <span className="absolute inset-y-0 left-0 grid w-1/2 place-items-center text-[12.5px] font-medium">Mainnet</span>
        <span className="absolute inset-y-0 right-0 grid w-1/2 place-items-center text-[12.5px] font-medium">Testnet</span>
      </div>
      <div className="absolute inset-x-0 top-[78px] h-[120px]">
        <NetworkFace net={MAINNET} anim="bento-swap-a" />
        <NetworkFace net={TESTNET} anim="bento-swap-b" />
      </div>
      <div className="absolute inset-x-6 top-[214px] flex items-center justify-between rounded-xl bg-[#1c1c1c] px-4 py-3 ring-1 ring-white/[0.04]">
        <span className="flex gap-1">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="size-2 rounded-[2px] bg-[#2a2a2a]" style={{ animation: `block-tick ${12 * BLOCK_TIME_SECONDS}s linear ${i * BLOCK_TIME_SECONDS}s infinite` }} />
          ))}
        </span>
        <span className="flex items-center gap-2 font-mono text-[12.5px] text-white/80">
          <span className="size-1.5 rounded-full bg-[#6ee7b7]" style={{ animation: "live-dot 1.6s ease-in-out infinite" }} />
          {block === null ? "live" : `#${formatBlock(block)}`}
        </span>
      </div>
    </div>
  );
}

/* ---------- Ecosystem: a strip of tool cards, each with its own small live picture ---------- */

const TOOLS: { name: string; note: string; Art: () => React.JSX.Element }[] = [
  { name: "Explorer", note: "Blocks and transactions", Art: ArtExplorer },
  { name: "Testnet Faucet", note: "Free tBOT for gas", Art: ArtFaucet },
  { name: "BDex", note: "Swap tokens", Art: ArtSwap },
  { name: "Bo Wallet", note: "Hold and send BOT", Art: ArtWallet },
  { name: "Bridge", note: "Move assets between chains", Art: ArtBridge },
  { name: "Staking", note: "Stake BOT, earn rewards", Art: ArtStaking },
  { name: "Ecosystem Support", note: "Help for builders", Art: ArtSupport },
];

function EcosystemPreview() {
  const doubled = [...TOOLS, ...TOOLS];
  return (
    <div className="absolute inset-0">
      <div
        className="grain size-full overflow-hidden"
        style={{
          background:
            "radial-gradient(60% 90% at 14% 0%, rgba(214,170,98,0.6), transparent 62%), radial-gradient(55% 80% at 92% 100%, rgba(110,90,58,0.55), transparent 62%), linear-gradient(135deg,#54442c 0%,#2b2217 55%,#141210 100%)",
        }}
      >
        <div aria-hidden className="absolute -right-20 top-0 size-72 rounded-full bg-[#e8c27a]/20 blur-3xl" style={{ animation: "bento-bob 9s ease-in-out infinite" }} />
        <div className="bento-fade-x relative z-[2] h-[calc(100%-60px)] overflow-hidden pt-5">
          <div className="flex w-max items-start gap-3 px-3" style={{ animation: "bento-left 70s linear infinite", ["--tone" as string]: "232 194 122" }}>
            {doubled.map(({ name, note, Art }, i) => (
              <div
                key={i}
                className={`w-[220px] shrink-0 rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-white/[0.1] ${i % 2 ? "mt-5" : ""}`}
              >
                <div className="relative h-[150px] overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/[0.06]">
                  {/* the pictures are drawn for a 280x210 card; scale them down to fit this one */}
                  <div className="absolute left-0 top-0 h-[210px] w-[280px] origin-top-left scale-[0.714]">
                    <Art />
                  </div>
                </div>
                <p className="mt-3 px-1.5 text-[16px] font-medium leading-5">{name}</p>
                <p className="px-1.5 pb-1.5 pt-0.5 text-[12.5px] leading-5 text-white/60">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Chain: blocks dropping onto a chain, one per block time ---------- */

const ROW = 56;
const ROW_GAP = 10;
const SLOT = ROW + ROW_GAP;
const SHOWN = 6;
const AGE = ["now", ...Array.from({ length: SHOWN - 1 }, (_, i) => `${((i + 1) * BLOCK_TIME_SECONDS).toFixed(2)}s ago`)];

/** The live height, advanced locally every block time so the list keeps moving between the 3s RPC polls. */
function useBlockHead() {
  const { block } = useLiveBlock();
  const [head, setHead] = useState<number | null>(null);
  const base = useRef<{ height: number; at: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (block !== null) base.current = { height: block, at: Date.now() };
  }, [block]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      const b = base.current;
      if (b) setHead(b.height + Math.floor((Date.now() - b.at) / (BLOCK_TIME_SECONDS * 1000)));
    };
    const io = new IntersectionObserver(([e]) => {
      if (timer) clearInterval(timer);
      timer = null;
      if (e.isIntersecting) {
        tick();
        timer = setInterval(tick, BLOCK_TIME_SECONDS * 1000);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);

  return { head: head ?? block, box };
}

function Cube({ hot }: { hot?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className={hot ? "text-accent" : "text-white/55"}>
      <path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4L12 2.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4.3 7.6 12 12l7.7-4.4M12 12v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ChainPreview() {
  const { head, box } = useBlockHead();
  const heights = head === null ? [] : Array.from({ length: SHOWN }, (_, i) => head - i);
  return (
    <div ref={box} className="absolute inset-0">
      <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pl-3 pr-3.5 font-mono text-[12px] text-white/85 ring-1 ring-white/[0.08]">
        <span className="size-1.5 rounded-full bg-accent" style={{ animation: "live-dot 1.6s ease-in-out infinite", boxShadow: "0 0 8px rgba(47,219,166,0.7)" }} />
        BOT Chain mainnet
      </div>
      <div className="absolute right-5 top-5 z-10 rounded-full bg-white/[0.06] px-3.5 py-1.5 font-mono text-[12px] text-white/60 ring-1 ring-white/[0.08]">
        {BLOCK_TIME_SECONDS}s blocks
      </div>

      <div className="absolute inset-x-0 top-[68px] bottom-0 overflow-hidden px-5 pt-px">
        <div key={head ?? "idle"} className="relative flex flex-col" style={{ gap: ROW_GAP, animation: head === null ? undefined : `bento-drop 0.5s var(--ease-expo) both`, ["--slot" as string]: `${SLOT}px` }}>
          <span aria-hidden className="absolute bottom-0 top-3 w-px bg-gradient-to-b from-accent/60 via-white/15 to-transparent" style={{ left: 34 }} />
          {heights.map((h, i) => (
            <div
              key={h}
              className={`relative flex items-center gap-3 rounded-2xl px-4 ring-1 ${i === 0 ? "bg-[#17231f] ring-accent/30" : "bg-[#1b1b1b] ring-white/[0.06]"}`}
              style={{ height: ROW, ...(i === 0 ? { animation: "bento-pop 0.5s var(--ease-expo) both" } : { opacity: 1 - i * 0.12 }) }}
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${i === 0 ? "bg-accent/15" : "bg-white/[0.06]"}`}>
                <Cube hot={i === 0} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[14.5px] tracking-tight text-white">#{formatBlock(h)}</span>
                <span className="block text-[12px] text-muted">{i === 0 ? "Latest block" : "Block"}</span>
              </span>
              <span className={`font-mono text-[12px] ${i === 0 ? "text-accent" : "text-white/40"}`}>{AGE[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Bento() {
  return (
    <Container tight>
      <div className="grid gap-3 pb-12 pt-4 sm:pb-20 lg:grid-cols-3">
        <Reveal>
          <Card href="/ask" label="Ask">
            <ChatPreview />
          </Card>
        </Reveal>
        <Reveal delay={80}>
          <Card href="/ask?q=How%20do%20I%20deploy%20a%20contract%20with%20Remix%3F" label="Deploy">
            <TerminalPreview />
          </Card>
        </Reveal>
        <Reveal delay={160}>
          <Card href="#network" label="Network">
            <NetworkPreview />
          </Card>
        </Reveal>
        <Reveal delay={60} className="lg:col-span-2">
          <Card href="#ecosystem" label="Ecosystem">
            <EcosystemPreview />
          </Card>
        </Reveal>
        <Reveal delay={140}>
          <Card href={MAINNET.explorer} external label="Chain">
            <ChainPreview />
          </Card>
        </Reveal>
      </div>
    </Container>
  );
}
