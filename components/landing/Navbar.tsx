"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LINKS, shortAddress } from "@/lib/config";
import { useWallet } from "@/lib/wallet";
import { Arrow, Chevron, External, Logo, Pill } from "../ui";

type Item = { t: string; d?: string; href: string; ext?: boolean };
type Menu = { id: string; label: string; items: Item[]; preview: "chat" | "code" | "links" };

const MENUS: Menu[] = [
  {
    id: "product",
    label: "Product",
    preview: "chat",
    items: [
      { t: "Ask", d: "Questions about building on BOT Chain, answered from the docs.", href: "/ask" },
      { t: "Network", d: "Chain IDs, RPC and one-click MetaMask setup.", href: "#network" },
      { t: "Deploy", d: "Remix, Hardhat and Foundry walkthroughs.", href: "#deploy" },
    ],
  },
  {
    id: "developers",
    label: "Developers",
    preview: "code",
    items: [
      { t: "Official docs", d: "The BOT Chain developer documentation.", href: LINKS.docs, ext: true },
      { t: "GitHub", d: "Source and tooling from the BOT Chain team.", href: LINKS.github, ext: true },
      { t: "Snippets", d: "Copy-ready setup for common tools.", href: "#developers" },
    ],
  },
  {
    id: "ecosystem",
    label: "Ecosystem",
    preview: "links",
    items: [
      { t: "Explorer", d: "Browse blocks, contracts and transactions.", href: LINKS.explorer, ext: true },
      { t: "Testnet faucet", d: "Get test BOT for gas.", href: LINKS.faucet, ext: true },
      { t: "All tools", d: "BDex, Bo Wallet, Bridge, Staking and more.", href: "#ecosystem" },
    ],
  },
];

function Preview({ kind }: { kind: Menu["preview"] }) {
  if (kind === "chat") {
    return (
      <div className="flex h-full flex-col justify-end gap-2 p-4 text-[12px]">
        <div className="ml-auto max-w-[80%] rounded-2xl bg-[#2a2a2a] px-3 py-2">Add BOT Chain to MetaMask</div>
        <div className="max-w-[88%] rounded-2xl bg-[#1c1c1c] px-3 py-2 text-white/80">
          Add a custom network with chain ID 677 and the RPC from the docs{" "}
          <span className="rounded bg-white/10 px-1 font-mono text-[10px]">[1]</span>
        </div>
      </div>
    );
  }
  if (kind === "code") {
    return (
      <pre className="h-full overflow-hidden p-4 font-mono text-[11px] leading-5 text-white/80">
        <span className="tok-c">{"// hardhat.config.js"}</span>
        {"\n"}
        <span className="tok-k">networks</span>: {"{"}
        {"\n  "}
        <span className="tok-f">botMainnet</span>: {"{"}
        {"\n    "}url: <span className="tok-s">&quot;https://rpc.botchain.ai&quot;</span>,
        {"\n    "}chainId: <span className="tok-s">677</span>
        {"\n  }\n}"}
      </pre>
    );
  }
  return (
    <div className="flex h-full flex-wrap content-end gap-2 p-4">
      {["Explorer", "Faucet", "BDex", "Bo Wallet", "Bridge", "Staking"].map((x) => (
        <span key={x} className="rounded-full bg-[#262626] px-3 py-1.5 text-[12px]">
          {x}
        </span>
      ))}
    </div>
  );
}

function WalletButton({ className = "" }: { className?: string }) {
  const { hasProvider, address, busy, connect } = useWallet();
  if (!hasProvider) {
    return (
      <Pill tone="dark" size="sm" href={LINKS.metamask} className={className}>
        Install MetaMask
      </Pill>
    );
  }
  return (
    <Pill tone="dark" size="sm" onClick={connect} disabled={busy} className={className}>
      <Image src="/brand/wallet.png" alt="" width={16} height={16} className="size-4" />
      {address ? (
        <span className="font-mono text-[13px]">{shortAddress(address)}</span>
      ) : (
        "Connect wallet"
      )}
    </Pill>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [past, setPast] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 8);
      setPast(window.scrollY > 520);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!drawer) return;
    const menuBtn = menuBtnRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      menuBtn?.focus();
    };
  }, [drawer]);

  const hold = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(id);
  };
  const release = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  const current = MENUS.find((m) => m.id === open);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      onMouseLeave={release}
      onKeyDown={(e) => e.key === "Escape" && setOpen(null)}
    >
      <div
        className={`pointer-events-none absolute inset-0 -z-10 bg-bg/85 backdrop-blur-[12px] transition-opacity duration-200 ${scrolled || open ? "opacity-100" : "opacity-0"}`}
      />
      <div className="relative mx-auto max-w-[1280px] px-4 lg:px-6">
        <nav
          aria-label="Main"
          className={`flex h-16 items-center justify-between gap-4 border-b transition-colors duration-200 ${scrolled || open ? "border-line" : "border-transparent"}`}
        >
          <div className="flex items-center gap-9">
            <Link href="/" aria-label="BOTGuide home" className="text-white">
              <Logo />
            </Link>
            <ul className="hidden items-center gap-1 lg:flex">
              {MENUS.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    aria-expanded={open === m.id}
                    aria-haspopup="true"
                    onMouseEnter={() => hold(m.id)}
                    onFocus={() => hold(m.id)}
                    onClick={() => setOpen(open === m.id ? null : m.id)}
                    className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] text-white/90 transition-colors duration-150 hover:text-white"
                  >
                    {m.label}
                    <Chevron
                      className={`transition-transform duration-200 ${open === m.id ? "rotate-180" : ""}`}
                    />
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="#tips"
                  onMouseEnter={() => setOpen(null)}
                  className="rounded-full px-3.5 py-2 text-[14px] text-white/90 transition-colors hover:text-white"
                >
                  Community tips
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onMouseEnter={() => setOpen(null)}
                  className="rounded-full px-3.5 py-2 text-[14px] text-white/90 transition-colors hover:text-white"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <WalletButton />
            </div>
            <div className={`${past ? "block" : "hidden"} sm:block`}>
              <Pill href="/ask" size="sm">
                Ask BOTGuide <Arrow />
              </Pill>
            </div>
            <button
              ref={menuBtnRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={drawer}
              onClick={() => setDrawer(true)}
              className="grid size-10 place-items-center rounded-full bg-pill lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </nav>

        {current && (
          <div
            key="panel"
            onMouseEnter={() => hold(current.id)}
            className="absolute left-[150px] top-[calc(100%-4px)] hidden w-[640px] overflow-hidden rounded-2xl bg-[#101010] ring-1 ring-white/[0.07] lg:block"
            style={{ animation: "menu-in 300ms var(--ease-panel) both" }}
          >
            <div className="grid grid-cols-[1fr_0.95fr]">
              <ul key={current.id} className="p-3">
                {current.items.map((it, i) => {
                  const inner = (
                    <>
                      <span className="flex items-center gap-1.5 text-[14px] font-medium">
                        {it.t}
                        {it.ext && <External className="text-muted" />}
                      </span>
                      {it.d && <span className="mt-0.5 block text-[12.5px] leading-5 text-muted">{it.d}</span>}
                    </>
                  );
                  const cls =
                    "block rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-white/[0.05]";
                  const style = { animation: `pop 250ms var(--ease-expo) both`, animationDelay: `${i * 25}ms` };
                  return (
                    <li key={it.t} style={style}>
                      {it.ext ? (
                        <a href={it.href} target="_blank" rel="noopener noreferrer" className={cls}>
                          {inner}
                        </a>
                      ) : it.href.startsWith("/") ? (
                        <Link href={it.href} className={cls} onClick={() => setOpen(null)}>
                          {inner}
                        </Link>
                      ) : (
                        <a href={it.href} className={cls} onClick={() => setOpen(null)}>
                          {inner}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="m-3 ml-0 min-h-[190px] overflow-hidden rounded-xl bg-card">
                <div key={current.id} className="h-full" style={{ animation: "fade 160ms ease-out both" }}>
                  <Preview kind={current.preview} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-bg px-4 lg:hidden" role="dialog" aria-modal="true">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawer(false)}
              className="grid size-10 place-items-center rounded-full bg-pill"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="m2 2 10 10M12 2 2 12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="mt-4 space-y-6">
            {MENUS.map((m) => (
              <div key={m.id}>
                <p className="mb-2 text-[12px] uppercase tracking-wider text-muted">{m.label}</p>
                <ul>
                  {m.items.map((it) => {
                    const cls = "flex items-center justify-between py-3.5 text-[18px]";
                    return (
                      <li key={it.t} className="hairline-b">
                        {it.href.startsWith("/") ? (
                          <Link href={it.href} onClick={() => setDrawer(false)} className={cls}>
                            {it.t}
                          </Link>
                        ) : (
                          <a
                            href={it.href}
                            target={it.ext ? "_blank" : undefined}
                            rel={it.ext ? "noopener noreferrer" : undefined}
                            onClick={() => setDrawer(false)}
                            className={cls}
                          >
                            {it.t}
                            {it.ext && <External className="text-muted" />}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <ul>
              {[
                ["Community tips", "#tips"],
                ["FAQ", "#faq"],
              ].map(([t, h]) => (
                <li key={t} className="hairline-b">
                  <a href={h} onClick={() => setDrawer(false)} className="block py-3.5 text-[18px]">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
            <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-line bg-bg px-4 pb-6 pt-4">
              <Pill href="/ask" full>
                Ask BOTGuide <Arrow />
              </Pill>
              <WalletButton className="w-full" />            </div>
          </div>
        </div>
      )}
    </header>
  );
}
