"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Container, SectionHead } from "../ui";
import { DemoPanel, TONE, type DemoId } from "./demos";

type Feature = {
  id: DemoId;
  anchor: string;
  title: string;
  lead: string;
  bullets: string[];
  icon: ReactNode;
};

const stroke = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const FEATURES: Feature[] = [
  {
    id: "ask",
    anchor: "ask",
    title: "Ask",
    lead: "Ask in plain English. BOTGuide searches the BOT Chain docs and answers step by step.",
    bullets: [
      "Follow-up questions keep their context",
      "Code blocks you can copy in one click",
      "Says so when the docs don't cover it",
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4h-.5A1.5 1.5 0 0 1 4 14.5v-9Z" {...stroke} />
      </svg>
    ),
  },
  {
    id: "sources",
    anchor: "sources",
    title: "Sources",
    lead: "Every answer links to the doc section it came from, so you can check it yourself.",
    bullets: [
      "Numbered citations under each answer",
      "Official docs and community notes are labeled",
      "Chain IDs and RPC URLs come from a fixed config, never generated",
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="M7 3h7l5 5v13H7V3Z" {...stroke} />
        <path d="M14 3v5h5M10 13h6M10 17h6" {...stroke} />
      </svg>
    ),
  },
  {
    id: "deploy",
    anchor: "deploy",
    title: "Deploy",
    lead: "Walkthroughs for Remix, Hardhat and Foundry with BOT Chain's network settings filled in.",
    bullets: [
      "Testnet first, then mainnet",
      "Config snippets for the tool you use",
      "Fixes for wrong chain, out of gas, nonce and reverted transactions",
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="m4 17 6-5-6-5M12 19h8" {...stroke} />
      </svg>
    ),
  },
  {
    id: "network",
    anchor: "network",
    title: "Network",
    lead: "Chain IDs, RPC URLs and the explorer in one place, with one-click MetaMask setup.",
    bullets: [
      "Mainnet 677 and testnet 968",
      "Live block height straight from the RPC",
      "Add BOT Chain to MetaMask without typing a thing",
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" {...stroke} />
        <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" {...stroke} />
      </svg>
    ),
  },
  {
    id: "vote",
    anchor: "vote",
    title: "Rate and contribute",
    lead: "Rate answers on BOT Chain and share tips the community can upvote.",
    bullets: [
      "One vote per wallet per answer",
      "Tips reach the AI only after the owner approves them",
      "No tokens, no payments",
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="M7 11v9H4v-9h3Zm0 0 4-8c1.7 0 2.5 1.1 2.2 2.6L12.6 9H19a1.5 1.5 0 0 1 1.5 1.8l-1.4 7A2 2 0 0 1 17.1 19H7" {...stroke} />
      </svg>
    ),
  },
];

type Topic = { t: string; d: string; q: string };
const COVERAGE: { group: string; tone: string; items: Topic[] }[] = [
  {
    group: "Wallet",
    tone: "255 122 42",
    items: [{ t: "MetaMask setup", d: "Add BOT Chain in one click or by hand", q: "How do I add BOT Chain to MetaMask?" }],
  },
  {
    group: "Network",
    tone: "24 206 190",
    items: [
      { t: "Network and RPC", d: "Mainnet, testnet, explorers", q: "What are the chain ID, RPC URL and explorer for mainnet and testnet?" },
      { t: "Testnet faucet", d: "Get test BOT for gas", q: "How do I get testnet BOT?" },
      { t: "Testnet vs mainnet", d: "What changes between the two", q: "What is the difference between BOT Chain testnet and mainnet?" },
    ],
  },
  {
    group: "Deploy",
    tone: "240 205 120",
    items: [
      { t: "Remix", d: "Compile and deploy in the browser", q: "How do I deploy a contract with Remix?" },
      { t: "Hardhat", d: "Network config and deploy scripts", q: "Hardhat config for BOT Chain" },
      { t: "Foundry", d: "forge, cast and RPC settings", q: "How do I deploy with Foundry on BOT Chain?" },
    ],
  },
  {
    group: "Libraries",
    tone: "110 168 255",
    items: [
      { t: "ethers.js", d: "Providers, signers and contracts", q: "How do I connect to BOT Chain with ethers.js?" },
      { t: "web3.js", d: "Connect and send transactions", q: "How do I connect to BOT Chain with web3.js?" },
    ],
  },
  {
    group: "Help",
    tone: "240 140 170",
    items: [
      { t: "Verify a contract", d: "Publish source on the explorer", q: "How do I verify my contract?" },
      { t: "Common errors", d: "Wrong chain, gas, nonce, reverts", q: "Why is my transaction failing?" },
      { t: "Ecosystem", d: "Explorer, BDex, Bo Wallet, Bridge, Staking", q: "What tools are in the BOT Chain ecosystem?" },
    ],
  },
];

export default function Showcase() {
  const [active, setActive] = useState<DemoId>("ask");
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.getAttribute("data-feature") as DemoId);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Container id="product" className="hairline-t">
        <p className="mb-10 text-[13px] text-muted lg:mb-0">Product</p>
        <div className="lg:grid lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            {FEATURES.map((f) => (
              <div
                key={f.id}
                id={f.anchor}
                data-feature={f.id}
                ref={(el) => {
                  refs.current[f.id] = el;
                }}
                style={{ ["--tone" as string]: TONE[f.id], borderColor: active === f.id ? `rgb(${TONE[f.id]})` : undefined }}
                className={`my-6 border-l-2 border-white/10 py-4 pl-6 transition-[opacity,border-color] duration-500 lg:my-0 lg:py-9 ${active === f.id ? "lg:opacity-100" : "lg:opacity-30"}`}
              >
                <p className="mb-3 font-mono text-[12px] tracking-wide text-[rgb(var(--tone))]">
                  {String(FEATURES.indexOf(f) + 1).padStart(2, "0")} / {String(FEATURES.length).padStart(2, "0")}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[rgb(var(--tone))]">{f.icon}</span>
                  <h2 className="text-[30px] font-medium leading-9 tracking-[-0.01em]">{f.title}</h2>
                </div>
                <p className="mt-4 max-w-[30rem] text-[18px] leading-7 text-white/90">{f.lead}</p>
                <ul className="mt-6 space-y-3">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[15px] leading-6 text-white/85">
                      <Check className="mt-1 shrink-0 text-[rgb(var(--tone)/0.8)]" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 lg:hidden">
                  <DemoPanel id={f.id} play={active === f.id} />
                </div>
              </div>
            ))}
          </div>
          <div className="relative hidden lg:block">
            <div className="sticky top-[calc(50vh-250px)]">
              <DemoPanel key={active} id={active} play />
            </div>
          </div>
        </div>
      </Container>

      <Container className="hairline-t">
        <SectionHead eyebrow="Topics" title="Ask about any of these">
          The knowledge base is built from the official developer docs, the BOT Chain site and notes from real builds. Pick a topic to ask it.
        </SectionHead>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {COVERAGE.map((g) => (
            <div
              key={g.group}
              className="grid gap-3 py-5 sm:grid-cols-[150px_1fr] sm:items-center sm:gap-6"
              style={{ ["--tone" as string]: g.tone }}
            >
              <p className="flex items-center gap-2.5 text-[14px] text-white/80">
                <span className="size-2 rounded-full bg-[rgb(var(--tone))]" />
                {g.group}
              </p>
              <ul className="flex flex-wrap gap-2.5">
                {g.items.map((i) => (
                  <li key={i.t}>
                    <Link
                      href={`/ask?q=${encodeURIComponent(i.q)}`}
                      title={i.d}
                      className="group flex items-center gap-2 rounded-full bg-pill/60 py-2.5 pl-4 pr-3.5 text-[14.5px] text-white/90 ring-1 ring-white/[0.04] transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-[rgb(var(--tone)/0.14)] hover:ring-[rgb(var(--tone)/0.45)]"
                    >
                      {i.t}
                      <span aria-hidden className="text-muted transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--tone))]">
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
