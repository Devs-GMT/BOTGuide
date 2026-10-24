"use client";

import { useState } from "react";
import { LINKS, MAINNET, TESTNET, type Network } from "@/lib/config";
import { formatBlock, useLiveBlock } from "@/lib/hooks";
import { addNetwork, useHasProvider } from "@/lib/wallet";
import { IconClose } from "./icons";

function Row({ k, v, href }: { k: string; v: string; href?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-[12.5px]">
      <dt className="shrink-0 text-muted">{k}</dt>
      <dd className="min-w-0 break-all text-right font-mono text-[12px] text-white/90">
        {href ? (
          <a href={v} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {v.replace("https://", "")}
          </a>
        ) : (
          v
        )}
      </dd>
    </div>
  );
}

function NetworkCard({ net }: { net: Network }) {
  const hasProvider = useHasProvider();
  const [status, setStatus] = useState<"idle" | "busy" | "ok" | "err">("idle");

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
    <section className="rounded-2xl bg-card p-4 ring-1 ring-white/[0.06]" aria-label={`${net.label} facts`}>
      <h3 className="text-[14px] font-medium">{net.label}</h3>
      <dl className="mt-2 divide-y divide-white/[0.06]">
        <Row k="Chain ID" v={String(net.chainId)} />
        <Row k="RPC URL" v={net.rpc} />
        <Row k="Explorer" v={net.explorer} href />
      </dl>
      <button
        type="button"
        onClick={add}
        disabled={status === "busy"}
        className="mt-3 w-full rounded-full bg-white px-4 py-2.5 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-white/85 disabled:opacity-60"
      >
        {!hasProvider
          ? "Install MetaMask"
          : status === "ok"
            ? "Added to MetaMask"
            : status === "busy"
              ? "Check MetaMask…"
              : status === "err"
                ? "Try again"
                : `Add ${net.label} to MetaMask`}
      </button>
    </section>
  );
}

export default function FactsPanel({ highlight, onClose }: { highlight: boolean; onClose: () => void }) {
  const { block, error } = useLiveBlock();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-[15px] font-medium">Network facts</h2>
        <button type="button" aria-label="Close network facts" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/[0.07] hover:text-white">
          <IconClose size={15} />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {highlight && (
          <p className="rounded-xl bg-[#3b2a1e] px-3.5 py-2.5 text-[12.5px] leading-5 text-[#f0a35e]" style={{ animation: "pop 220ms var(--ease-panel) both" }}>
            This answer mentions network values. Double-check them here or in the official docs.
          </p>
        )}
        <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-white/[0.06]">
          <span className="text-[12.5px] text-muted">Live block, mainnet</span>
          <span className="flex items-center gap-2 font-mono text-[13px]" aria-live="polite">
            <span className={`size-1.5 rounded-full ${error && block === null ? "bg-[#ff6b6b]" : "bg-[#5ecb7f]"}`} />
            {error && block === null ? "RPC not responding" : formatBlock(block)}
          </span>
        </div>
        <NetworkCard net={MAINNET} />
        <NetworkCard net={TESTNET} />
        <p className="px-1 text-[11.5px] leading-5 text-muted">
          Values come from a fixed config, never from the AI. If anything differs from the{" "}
          <a href={LINKS.docs} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
            official docs
          </a>
          , trust the docs.
        </p>
      </div>
    </div>
  );
}
