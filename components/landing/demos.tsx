"use client";

import { useState, type ReactNode } from "react";
import { MAINNET, TESTNET, type Network } from "@/lib/config";
import { useClock, useLiveBlock, formatBlock } from "@/lib/hooks";
import { addNetwork, useHasProvider } from "@/lib/wallet";
import { Check, External, Window } from "../ui";

export type DemoId = "ask" | "sources" | "deploy" | "network" | "vote";

export const DEMO_END: Record<DemoId, number> = {
  ask: 8200,
  sources: 5600,
  deploy: 6600,
  network: 1200,
  vote: 5400,
};

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

/* ---------- frame ---------- */

/** One muted colour per feature: it tints the panel glow, the badge and the key element inside. */
export const TONE: Record<DemoId, string> = {
  ask: "255 255 255",
  sources: "255 255 255",
  deploy: "255 255 255",
  network: "255 255 255",
  vote: "255 255 255",
};

const LABEL: Record<DemoId, [string, string]> = {
  ask: ["Ask", "Preview"],
  sources: ["Sources", "Preview"],
  deploy: ["Deploy", "Example"],
  network: ["Network", "Live"],
  vote: ["Rate and contribute", "Preview"],
};

function Frame({
  id,
  composer,
  withComposer,
  children,
}: {
  id: DemoId;
  composer?: string;
  /** only the Ask panel shows the chat input; the other panels have their own content */
  withComposer?: boolean;
  children: ReactNode;
}) {
  const [title, badge] = LABEL[id];
  return (
    <div
      className="relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-white/[0.06]"
      style={{ ["--tone" as string]: TONE[id] }}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[rgb(var(--tone)/0.13)] blur-3xl" />
      <div className="relative flex items-center justify-between px-5 pt-4 text-[12px]">
        <span className="flex items-center gap-2 text-white/70">
          <span className="size-1.5 rounded-full bg-[rgb(var(--tone))]" />
          {title}
        </span>
        <span className="rounded-full bg-[rgb(var(--tone)/0.12)] px-2.5 py-0.5 text-[11px] text-[rgb(var(--tone))]">{badge}</span>
      </div>
      <div className={`relative min-h-0 flex-1 px-5 pt-4 ${withComposer ? "overflow-hidden" : ""}`}>{children}</div>
      {withComposer ? (
        <div className="relative m-3 flex items-center gap-3 rounded-2xl bg-[#1e1e1e] py-2.5 pl-4 pr-2.5">
          <span className="text-muted">+</span>
          <span className={`min-w-0 flex-1 truncate text-[14px] ${composer ? "text-white" : "text-muted"}`}>
            {composer ?? "Ask about BOT Chain…"}
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-white text-[#0a0a0a]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      ) : (
        <div className="h-5" />
      )}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-center text-[12px] text-muted">{children}</p>;
}

function Cite({ n, active }: { n: number; active?: boolean }) {
  return (
    <span
      className={`mx-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded px-1 align-baseline font-mono text-[10.5px] transition-colors duration-200 ${active ? "bg-[rgb(var(--tone))] text-[#0a0a0a]" : "bg-[rgb(var(--tone)/0.16)] text-[rgb(var(--tone))]"}`}
    >
      {n}
    </span>
  );
}

/* ---------- Ask ---------- */

const PROMPT = "How do I add BOT Chain to MetaMask?";
const ANSWER =
  "Add it as a custom network in MetaMask: chain ID 677, RPC https://rpc.botchain.ai and explorer https://scan.botchain.ai [1]. On testnet use chain ID 968 with https://rpc.bohr.life [2].";

function renderToken(tok: string, i: number) {
  const m = tok.match(/^\[(\d)\](.*)$/);
  if (m)
    return (
      <span key={i}>
        <Cite n={Number(m[1])} />
        {m[2]}{" "}
      </span>
    );
  if (/^(https?:\/\/|\d{3}$)/.test(tok))
    return (
      <span key={i}>
        <span className="rounded bg-white/[0.07] px-1 font-mono text-[12.5px]">{tok.replace(/[.,]$/, "")}</span>
        {/[.,]$/.test(tok) ? tok.slice(-1) : ""}{" "}
      </span>
    );
  return <span key={i}>{tok} </span>;
}

function AskDemo({ play }: { play: boolean }) {
  const t = useClock(play, DEMO_END.ask);
  const typed = Math.floor(clamp((t - 700) / (PROMPT.length * 45)) * PROMPT.length);
  const sentAt = 700 + PROMPT.length * 45 + 400;
  const sent = t >= sentAt;
  const searching = t >= sentAt + 300 && t < sentAt + 1300;
  const answerAt = sentAt + 1300;
  const tokens = ANSWER.split(" ");
  const shown = t < answerAt ? 0 : Math.min(tokens.length, Math.floor((t - answerAt) / 55) + 1);
  const done = shown >= tokens.length;
  const composer = sent ? undefined : typed > 0 ? PROMPT.slice(0, typed) : undefined;

  return (
    <Frame id="ask" withComposer composer={composer}>
      <div className="flex h-full flex-col justify-end gap-3 pb-3">
        {sent && (
          <div className="pop-in ml-auto max-w-[85%] rounded-2xl bg-[#2a2a2a] px-4 py-2.5 text-[14px]">{PROMPT}</div>
        )}
        {searching && (
          <div className="pop-in flex items-center gap-2 text-[12.5px] text-muted">
            <span className="size-3 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-white/20 border-t-white/70" />
            Searching the docs…
          </div>
        )}
        {shown > 0 && (
          <div className="text-[14px] leading-[1.65] text-white/90">
            <div className="mb-2 text-[12px] text-muted">Found 2 sections</div>
            {tokens.slice(0, shown).map(renderToken)}
            {!done && <span className="caret" />}
            {done && (
              <div className="pop-in mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#262626] px-3 py-1 text-[12px]">
                  <Cite n={1} /> Network &amp; RPC · Official docs
                </span>
                <span className="rounded-full bg-[#262626] px-3 py-1 text-[12px]">
                  <Cite n={2} /> Common errors · Community note
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-white/70">
                  And on testnet?
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ---------- Sources ---------- */

function SourcesDemo({ play }: { play: boolean }) {
  const t = useClock(play, DEMO_END.sources);
  const open = t >= 1000;
  const sweep = clamp((t - 1700) / 900);
  const linked = t >= 3000;
  return (
    <Frame id="sources">
      <div className="flex flex-col gap-4 pb-2">
        <p className="text-[14px] leading-[1.65] text-white/90">
          BOT Chain mainnet uses chain ID{" "}
          <span className="rounded bg-white/[0.07] px-1 font-mono text-[12.5px]">677</span>
          <Cite n={1} active={open} />
        </p>
        {open && (
          <div className="pop-in overflow-hidden rounded-xl bg-[#101010] ring-1 ring-white/[0.07]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5 text-[12px] text-muted">
              <span className="font-mono">dev-docs.botchain.ai</span>
              <span>›</span>
              <span>Network</span>
              <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10.5px] text-white/70">Official docs</span>
            </div>
            <div className="space-y-1.5 px-4 py-3 font-mono text-[12.5px]">
              <p className="text-muted">## Mainnet</p>
              <p className="-mx-1 rounded px-1" style={{ backgroundImage: "linear-gradient(90deg, rgb(var(--tone) / 0.3), rgb(var(--tone) / 0.3))", backgroundRepeat: "no-repeat", backgroundSize: `${sweep * 100}% 100%` }}>
                Chain ID&nbsp;&nbsp;&nbsp;&nbsp;677
              </p>
              <p className="text-white/70">RPC URL&nbsp;&nbsp;&nbsp;&nbsp;https://rpc.botchain.ai</p>
              <p className="text-white/70">Explorer&nbsp;&nbsp;&nbsp;https://scan.botchain.ai</p>
            </div>
            {linked && (
              <div className="pop-in border-t border-white/[0.06] px-4 py-2.5 text-[12px] text-white/80">
                Open this section <External className="ml-1 inline text-muted" />
              </div>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ---------- Deploy ---------- */

function DeployDemo({ play }: { play: boolean }) {
  const t = useClock(play, DEMO_END.deploy);
  const progress = clamp(t / 4300);
  const line = (at: number, node: ReactNode) =>
    t >= at ? <p className="pop-in">{node}</p> : <p className="invisible">.</p>;
  return (
    <Frame id="deploy">
      <Window
        title="botguide/deploy"
        className="min-h-[280px]"
        right={
          <span className="flex items-center gap-2 font-mono text-[11px] text-muted">
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
              <span className="block h-full bg-[rgb(var(--tone))]" style={{ width: `${progress * 100}%` }} />
            </span>
            {Math.round(progress * 100)}%
          </span>
        }
      >
        <div className="space-y-1.5 px-4 pb-4 pt-1 font-mono text-[12.5px] leading-5">
          {line(300, <><span className="text-muted">▸</span> compile Contract.sol {t >= 1200 && <span className="text-[#5ecb7f]">✓</span>}</>)}
          {line(1500, <><span className="text-muted">▸</span> network bot-mainnet <span className="text-muted">(677)</span></>)}
          {line(2400, <><span className="text-muted">▸</span> deploy {t >= 4200 && <span className="text-[#5ecb7f]">✓</span>}</>)}
          {line(4300, <><span className="text-[rgb(var(--tone))]">✦</span> Deployed to <span className="text-white">0x12ab…9f3c</span></>)}
          {t >= 4900 && (
            <div className="pop-in mt-3 overflow-hidden rounded-md text-[12px]">
              <p className="bg-[#3b1e22] px-2 py-0.5 text-[#ff8a98]">- network: &quot;bot-testnet&quot;</p>
              <p className="bg-[#1e3b26] px-2 py-0.5 text-[#7be39a]">+ network: &quot;bot-mainnet&quot;</p>
            </div>
          )}
        </div>
      </Window>
    </Frame>
  );
}

/* ---------- Network ---------- */

function NetworkDemo({ play }: { play: boolean }) {
  useClock(play, DEMO_END.network);
  const hasProvider = useHasProvider();
  const { block, error } = useLiveBlock();
  const [net, setNet] = useState<Network>(MAINNET);
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");

  const add = async () => {
    setStatus("busy");
    try {
      await addNetwork(net);
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  };

  const rows: [string, string][] = [
    ["Chain ID", String(net.chainId)],
    ["RPC URL", net.rpc],
    ["Explorer", net.explorer],
    ["Symbol", net.symbol],
  ];

  return (
    <Frame id="network">
      <div className="flex flex-col gap-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-full bg-[#101010] p-1 text-[12.5px]">
            {[MAINNET, TESTNET].map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => {
                  setNet(n);
                  setStatus("idle");
                }}
                className={`rounded-full px-3.5 py-1.5 transition-colors duration-150 ${net.key === n.key ? "bg-[rgb(var(--tone))] text-[#0a0a0a]" : "text-white/70 hover:text-white"}`}
              >
                {n.label}
              </button>
            ))}
          </div>
          <span className="flex items-center gap-2 font-mono text-[12px] text-muted" aria-live="polite">
            <span className={`size-1.5 rounded-full ${error && block === null ? "bg-[#ff6b6b]" : "bg-[#5ecb7f]"}`} />
            {error && block === null ? "RPC not responding" : `block ${formatBlock(block)}`}
          </span>
        </div>
        <dl className="divide-y divide-white/[0.06] rounded-xl bg-[#101010] px-4 ring-1 ring-white/[0.07]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
              <dt className="text-muted">{k}</dt>
              <dd className="truncate font-mono text-[12.5px]">{v}</dd>
            </div>
          ))}
        </dl>
        {hasProvider ? (
          <button
            type="button"
            onClick={add}
            disabled={status === "busy"}
            className="rounded-full bg-[rgb(var(--tone))] px-5 py-3 text-[14px] font-medium text-[#0a0a0a] transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {status === "ok" ? "Added to MetaMask" : status === "busy" ? "Check MetaMask…" : status === "err" ? "Try again" : `Add BOT Chain ${net.label} to MetaMask`}
          </button>
        ) : (
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-pill px-5 py-3 text-center text-[14px] font-medium transition-colors hover:bg-[#333]"
          >
            Install MetaMask to add the network
          </a>
        )}
      </div>
    </Frame>
  );
}

/* ---------- Vote ---------- */

function VoteDemo({ play }: { play: boolean }) {
  const t = useClock(play, DEMO_END.vote);
  const pressed = t >= 1200;
  const waiting = t >= 1800 && t < 3300;
  const done = t >= 3300;
  return (
    <Frame id="vote">
      <div className="flex flex-col gap-4 pb-2">
        <div className="rounded-2xl bg-[#101010] p-4 ring-1 ring-white/[0.07]">
          <p className="text-[13.5px] leading-6 text-white/85">
            Add a custom network with chain ID <span className="font-mono text-[12.5px]">677</span> and the RPC URL from the docs
            <Cite n={1} />
          </p>
          <div className="mt-3 flex items-center gap-2 text-[12.5px]">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors duration-200 ${pressed ? "bg-[rgb(var(--tone))] text-[#0a0a0a]" : "bg-[#262626] text-white/80"}`}
            >
              👍 Helpful
            </span>
            <span className="rounded-full bg-[#262626] px-3 py-1.5 text-white/80">👎</span>
            <span className="rounded-full bg-[#262626] px-3 py-1.5 text-white/80">Copy</span>
            <span className="rounded-full border border-white/15 px-3 py-1.5 text-white/70">+ Add a tip</span>
          </div>
        </div>
        <div className="min-h-[44px] text-[13px]">
          {waiting && (
            <p className="pop-in flex items-center gap-2 text-muted">
              <span className="size-3 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-white/20 border-t-white/70" />
              Confirm the transaction in your wallet…
            </p>
          )}
          {done && (
            <p className="pop-in flex items-center gap-2 text-[#7be39a]">
              <Check /> Recorded on BOT Chain. One vote per wallet per answer.
            </p>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* ---------- switch ---------- */

export function DemoPanel({ id, play }: { id: DemoId; play: boolean }) {
  const caption: Record<DemoId, string> = {
    ask: "Preview with a cached example answer",
    sources: "Preview",
    deploy: "Example output, not a real deployment",
    network: "Live: this block height and the button are real",
    vote: "Preview of the rating flow",
  };
  return (
    <div>
      {id === "ask" && <AskDemo play={play} />}
      {id === "sources" && <SourcesDemo play={play} />}
      {id === "deploy" && <DeployDemo play={play} />}
      {id === "network" && <NetworkDemo play={play} />}
      {id === "vote" && <VoteDemo play={play} />}
      <Caption>{caption[id]}</Caption>
    </div>
  );
}
