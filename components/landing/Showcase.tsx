"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Container } from "../ui";
import { DemoPanel, type DemoId } from "./demos";

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

const COVERAGE: [string, string][] = [
  ["MetaMask setup", "Add BOT Chain in one click or by hand"],
  ["Network and RPC", "Mainnet, testnet, explorers"],
  ["Testnet faucet", "Get test BOT for gas"],
  ["Remix", "Compile and deploy in the browser"],
  ["Hardhat", "Network config and deploy scripts"],
  ["Foundry", "forge, cast and RPC settings"],
  ["ethers.js", "Providers, signers and contracts"],
  ["web3.js", "Connect and send transactions"],
  ["Verify a contract", "Publish source on the explorer"],
  ["Common errors", "Wrong chain, gas, nonce, reverts"],
  ["Testnet vs mainnet", "What changes between the two"],
  ["Ecosystem", "Explorer, BDex, Bo Wallet, Bridge, Staking"],
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
                className={`py-10 transition-opacity duration-500 lg:py-12 ${active === f.id ? "lg:opacity-100" : "lg:opacity-20"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-white/90">{f.icon}</span>
                  <h2 className="text-[30px] font-medium leading-9 tracking-[-0.01em]">{f.title}</h2>
                </div>
                <p className="mt-4 max-w-[30rem] text-[18px] leading-7 text-white/90">{f.lead}</p>
                <ul className="mt-6 space-y-3">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[15px] leading-6 text-white/85">
                      <Check className="mt-1 shrink-0 text-muted" />
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
        <h2 className="text-[30px] font-medium leading-9 tracking-[-0.01em]">And much more</h2>
        <p className="mt-3 max-w-xl text-[16px] leading-7 text-muted">
          The knowledge base is built from the official developer docs, the BOT Chain site and notes from real builds.
        </p>
        <div className="mt-12 grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {COVERAGE.map(([t, d]) => (
            <div key={t}>
              <p className="text-[15px] font-medium">{t}</p>
              <p className="mt-1 text-[13.5px] leading-5 text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
