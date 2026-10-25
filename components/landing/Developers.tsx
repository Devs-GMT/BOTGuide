"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { LINKS, MAINNET, TESTNET, type Network } from "@/lib/config";
import { formatBlock, useLiveBlock } from "@/lib/hooks";
import { addNetwork, useHasProvider } from "@/lib/wallet";
import { highlight } from "../highlight";
import Reveal from "../Reveal";
import { Container, Eyebrow, Pill, Window } from "../ui";

type Tab = { id: string; file: string; code: string; hl: number };

const NETS = [MAINNET, TESTNET];

/** The four snippets for one network. `hl` is the line a developer looks for first. Values come from the fixed config. */
function snippets(net: Network): Tab[] {
  const key = net.key === "mainnet" ? "botMainnet" : "botTestnet";
  return [
    {
      id: "Remix",
      file: "remix · deploy",
      hl: 2,
      code: `// 1. Compile your contract in Remix
// 2. Deploy & Run > Environment: Injected Provider - MetaMask
// 3. Switch MetaMask to BOT Chain ${net.label} (chain ID ${net.chainId})
// 4. Press Deploy and confirm in your wallet`,
    },
    {
      id: "Hardhat",
      file: "hardhat.config.js",
      hl: 5,
      code: `module.exports = {
  solidity: "0.8.20",
  networks: {
    ${key}: {
      url: "${net.rpc}",
      chainId: ${net.chainId},
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};`,
    },
    {
      id: "Foundry",
      file: "terminal",
      hl: 2,
      code: `# deploy to BOT Chain ${net.label.toLowerCase()}
forge create src/Counter.sol:Counter \\
  --rpc-url ${net.rpc} \\
  --private-key $PRIVATE_KEY \\
  --broadcast`,
    },
    {
      id: "ethers.js",
      file: "index.mjs",
      hl: 2,
      code: `import { JsonRpcProvider, Wallet } from "ethers";

const provider = new JsonRpcProvider("${net.rpc}", ${net.chainId});
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

console.log(await provider.getBlockNumber());`,
    },
  ];
}

export default function Developers() {
  const [tabId, setTabId] = useState("Hardhat");
  const [net, setNet] = useState<Network>(MAINNET);
  const list = snippets(net);
  const tab = list.find((t) => t.id === tabId) ?? list[1];
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const hasProvider = useHasProvider();
  const { block } = useLiveBlock();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  // the highlight behind the active tab slides to it
  useLayoutEffect(() => {
    const place = () => {
      const el = tabRefs.current[list.findIndex((t) => t.id === tabId)];
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    };
    place();
    void document.fonts?.ready.then(place);
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId]);

  const copy = async () => {
    const ok = await copyText(tab.code);
    setCopied(ok ? "ok" : "fail");
    setTimeout(() => setCopied(null), 1800);
  };

  const add = async () => {
    if (!hasProvider) {
      window.open(LINKS.metamask, "_blank", "noopener,noreferrer");
      return;
    }
    setStatus("busy");
    try {
      await addNetwork(net);
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  };

  return (
    <Container id="developers" className="hairline-t">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal className="min-w-0">
          <Eyebrow>For developers</Eyebrow>
          <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-medium leading-[1.03] tracking-[-0.025em]">
            One chain.
            <br />
            Every tool you know.
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-7 text-white/80">
            Solidity, MetaMask, Hardhat, Foundry, ethers.js and web3.js, with minimal changes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Pill onClick={add} disabled={status === "busy"}>
              {status === "ok" ? "Added to MetaMask" : status === "busy" ? "Check MetaMask…" : status === "err" ? "Try again" : hasProvider ? `Add ${net.label} to MetaMask` : "Install MetaMask"}
            </Pill>
            <Pill href={LINKS.docs} tone="dark">
              Read docs
            </Pill>
          </div>
          <dl className="mt-12 flex flex-wrap gap-x-9 gap-y-6 text-[13px]">
            <div>
              <dt className="font-mono text-[20px] font-medium tracking-tight text-white sm:text-[22px]">{MAINNET.chainId}</dt>
              <dd className="mt-1 text-muted">chain ID</dd>
            </div>
            <div>
              <dt className="font-mono text-[20px] font-medium tracking-tight text-white sm:text-[22px]">{TESTNET.chainId}</dt>
              <dd className="mt-1 text-muted">testnet</dd>
            </div>
            <div>
              <dt className="font-mono text-[20px] font-medium tracking-tight text-white sm:text-[22px]">
                {block === null ? "—" : `#${formatBlock(block)}`}
              </dt>
              <dd className="mt-1 text-muted">live block</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="min-w-0" delay={140}>
          <div
            className="grain relative overflow-hidden rounded-[28px] p-6 sm:p-10"
            style={{
              background:
                "radial-gradient(90% 80% at 100% 0%, #6e5a3a 0%, transparent 60%), radial-gradient(80% 90% at 0% 100%, #2c2418 0%, transparent 65%), #141210",
            }}
          >
            <Window
              title={<span key={tab.id} className="inline-block animate-[fade_320ms_ease-out_both]">{tab.file}</span>}
              className="relative z-[2] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
              right={
                <div className="flex items-center gap-2">
                  <div role="group" aria-label="Network" className="inline-flex rounded-full bg-white/[0.06] p-0.5 text-[11.5px]">
                    {NETS.map((n) => (
                      <button
                        key={n.key}
                        type="button"
                        aria-pressed={net.key === n.key}
                        onClick={() => {
                          setNet(n);
                          setStatus("idle");
                        }}
                        className={`rounded-full px-2.5 py-1 transition-colors duration-150 ${net.key === n.key ? "bg-white text-[#0a0a0a]" : "text-white/60 hover:text-white"}`}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                <button
                  type="button"
                  onClick={copy}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted transition-colors hover:text-white"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" />
                    <path d="M9.5 4.5v-1A1.5 1.5 0 0 0 8 2H3.5A1.5 1.5 0 0 0 2 3.5V8a1.5 1.5 0 0 0 1.5 1.5h1" stroke="currentColor" />
                  </svg>
                  <span aria-live="polite">{copied === "ok" ? "Copied" : copied === "fail" ? "Copy failed" : "Copy"}</span>
                </button>
                </div>
              }
            >
              <pre
                key={`${tab.id}-${net.key}`}
                className="min-h-[280px] overflow-x-auto pb-6 pt-2 font-mono text-[12.5px] font-normal leading-6 text-white/85"
              >
                <code className="block">
                  {tab.code.split("\n").map((line, i) => (
                    <span
                      key={i}
                      className={`block min-h-6 px-5 ${i === tab.hl ? "bg-white/[0.07] shadow-[inset_2px_0_0_rgba(255,255,255,0.45)]" : ""}`}
                      style={{ animation: `line-in 320ms var(--ease-expo) ${i * 40}ms both` }}
                    >
                      {highlight(line)}
                    </span>
                  ))}
                </code>
              </pre>
            </Window>
          </div>
          <div role="tablist" aria-label="Tool" className="relative mt-5 flex flex-wrap gap-1">
            {pill && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-full bg-pill transition-[transform,width] duration-[450ms] ease-[var(--ease-expo)]"
                style={{ width: pill.w, transform: `translateX(${pill.x}px)` }}
              />
            )}
            {list.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                aria-selected={tab.id === t.id}
                type="button"
                onClick={() => setTabId(t.id)}
                className={`relative rounded-full px-3.5 py-1.5 text-[14px] transition-colors duration-200 ${tab.id === t.id ? "text-white" : "text-[#7d8187] hover:text-white"}`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </Container>
  );
}
