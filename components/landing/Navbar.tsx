"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LINKS, shortAddress } from "@/lib/config";
import { useWallet } from "@/lib/wallet";
import { Arrow, Chevron, External, Logo, Pill } from "../ui";
import WalletMenu from "../WalletMenu";

type PreviewId = "ask" | "sources" | "deploy" | "network" | "vote" | "docs" | "snippets" | "explorer" | "faucet" | "tools";
type Item = { t: string; d?: string; href: string; ext?: boolean; pv: PreviewId };
type Menu = { id: string; label: string; items: Item[] };

const MENUS: Menu[] = [
  {
    id: "product",
    label: "Product",
    items: [
      { t: "Ask", d: "Questions about building on BOT Chain, answered from the docs.", href: "#ask", pv: "ask" },
      { t: "Sources", d: "Every answer links to the doc section it came from.", href: "#sources", pv: "sources" },
      { t: "Deploy", d: "Remix, Hardhat and Foundry walkthroughs.", href: "#deploy", pv: "deploy" },
      { t: "Network", d: "Chain IDs, RPC and one-click MetaMask setup.", href: "#network", pv: "network" },
      { t: "Rate and contribute", d: "Vote on answers and share tips.", href: "#vote", pv: "vote" },
    ],
  },
  {
    id: "developers",
    label: "Developers",
    items: [
      { t: "Official docs", d: "The BOT Chain developer documentation.", href: LINKS.docs, ext: true, pv: "docs" },
      { t: "Snippets", d: "Copy-ready setup for common tools.", href: "#developers", pv: "snippets" },
    ],
  },
  {
    id: "ecosystem",
    label: "Ecosystem",
    items: [
      { t: "Explorer", d: "Browse blocks, contracts and transactions.", href: LINKS.explorer, ext: true, pv: "explorer" },
      { t: "Testnet faucet", d: "Get test BOT for gas.", href: LINKS.faucet, ext: true, pv: "faucet" },
      { t: "All tools", d: "BDex, Bo Wallet, Bridge, Staking and more.", href: "#ecosystem", pv: "tools" },
    ],
  },
];

const TOOLS: [string, string, string][] = [
  ["Explorer", LINKS.explorer, "24 206 190"],
  ["Faucet", LINKS.faucet, "74 222 128"],
  ["BDex", LINKS.bdex, "59 110 255"],
  ["Bo Wallet", LINKS.boWallet, "255 122 42"],
  ["Bridge", LINKS.bridge, "96 165 250"],
  ["Staking", LINKS.staking, "240 205 120"],
];

const TONE: Record<PreviewId, string> = {
  ask: "110 168 255",
  sources: "110 231 183",
  deploy: "240 205 120",
  network: "94 200 220",
  vote: "240 140 170",
  docs: "47 219 166",
  snippets: "110 168 255",
  explorer: "24 206 190",
  faucet: "74 222 128",
  tools: "255 255 255",
};

const row = "rounded-xl bg-white/[0.045] ring-1 ring-white/[0.06]";

/** The small picture on the right of the menu. It follows the item under the pointer. */
function Preview({ id }: { id: PreviewId }) {
  const wrap = "flex h-full flex-col justify-center gap-2 p-4 text-[12px]";
  const dot = <span className="size-1.5 shrink-0 rounded-full bg-[rgb(var(--tone))]" />;
  switch (id) {
    case "ask":
      return (
        <div className={wrap}>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#2a2a2a] px-3 py-2">Add BOT Chain to MetaMask</div>
          <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-[#1c1c1c] px-3 py-2 leading-5 text-white/80">
            Add a custom network with chain ID 677 and the RPC from the docs{" "}
            <span className="rounded bg-[rgb(var(--tone)/0.18)] px-1 font-mono text-[10px] text-[rgb(var(--tone))]">1</span>
          </div>
        </div>
      );
    case "sources":
      return (
        <div className={wrap}>
          <div className={`${row} overflow-hidden`}>
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2 text-[10.5px] text-muted">
              <span className="font-mono">dev-docs.botchain.ai</span>
              <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-white/70">Official docs</span>
            </div>
            <div className="space-y-1 px-3 py-2.5 font-mono text-[11px]">
              <p className="-mx-1 rounded bg-[rgb(var(--tone)/0.25)] px-1">Chain ID&nbsp;&nbsp;677</p>
              <p className="text-white/55">RPC URL&nbsp;&nbsp;rpc.botchain.ai</p>
            </div>
          </div>
        </div>
      );
    case "deploy":
      return (
        <div className={wrap}>
          <div className={`${row} space-y-1 px-3 py-3 font-mono text-[11px] leading-5`}>
            <p>
              <span className="text-muted">▸</span> compile <span className="text-[#5ecb7f]">✓</span>
            </p>
            <p>
              <span className="text-muted">▸</span> network bot-testnet <span className="text-muted">(968)</span>
            </p>
            <p>
              <span className="text-muted">▸</span> deploy <span className="text-[#5ecb7f]">✓</span>
            </p>
            <p className="text-[rgb(var(--tone))]">✦ Deployed</p>
          </div>
        </div>
      );
    case "network":
      return (
        <div className={wrap}>
          <div className={`${row} divide-y divide-white/[0.06] px-3`}>
            {[
              ["Chain ID", "677"],
              ["RPC", "rpc.botchain.ai"],
              ["Symbol", "BOT"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 text-[11px]">
                <span className="text-muted">{k}</span>
                <span className="font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "vote":
      return (
        <div className={wrap}>
          <div className={`${row} p-3`}>
            <p className="leading-5 text-white/80">Add a custom network with chain ID 677</p>
            <div className="mt-2.5 flex gap-2 text-[11px]">
              <span className="rounded-full bg-[rgb(var(--tone))] px-2.5 py-1 text-[#0a0a0a]">Helpful</span>
              <span className="rounded-full bg-[#262626] px-2.5 py-1">+ Add a tip</span>
            </div>
          </div>
        </div>
      );
    case "docs":
      return (
        <div className={wrap}>
          <div className={`${row} p-3`}>
            <p className="font-mono text-[10.5px] text-muted">dev-docs.botchain.ai</p>
            <ul className="mt-2 space-y-1.5 text-[11.5px] text-white/85">
              {["Developers Quick Guide", "JSON-RPC Endpoint", "Validator Creation Guide"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  {dot}
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    case "snippets":
      return (
        <pre className="flex h-full flex-col justify-center overflow-hidden p-4 font-mono text-[11px] leading-5 text-white/80">
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
    case "explorer":
      return (
        <div className={wrap}>
          <p className="px-1 font-mono text-[10px] tracking-wide text-muted">LATEST BLOCKS</p>
          {["now", "0.75s ago", "1.50s ago"].map((t, i) => (
            <div key={t} className={`${row} flex items-center justify-between px-3 py-2`} style={{ opacity: 1 - i * 0.25 }}>
              <span className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded bg-[rgb(var(--tone)/0.15)] text-[9px] text-[rgb(var(--tone))]">Bk</span>
                <span className="h-1.5 w-16 rounded-full bg-white/20" />
              </span>
              <span className="font-mono text-[10px] text-white/40">{t}</span>
            </div>
          ))}
        </div>
      );
    case "faucet":
      return (
        <div className={`${wrap} items-center text-center`}>
          <p className="font-mono text-[34px] font-light leading-none tracking-[-0.04em] text-[rgb(var(--tone))]">10</p>
          <p className="text-white/80">tBOT</p>
          <p className="text-[10.5px] text-muted">per address, every 24 hours</p>
        </div>
      );
    default:
      return (
        <div className="flex h-full flex-wrap content-center gap-2 p-4">
          {TOOLS.map(([name, href, tone]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#262626] px-3 py-1.5 text-[12px] transition-colors duration-150 hover:bg-[#303030]"
            >
              <span className="size-1.5 rounded-full" style={{ background: `rgb(${tone})` }} />
              {name}
            </a>
          ))}
        </div>
      );
  }
}

function WalletButton({ className = "", full = false }: { className?: string; full?: boolean }) {
  const { hasProvider } = useWallet();
  if (!hasProvider) {
    return (
      <Pill tone="dark" size="sm" href={LINKS.metamask} className={className}>
        Install MetaMask
      </Pill>
    );
  }
  return (
    <WalletMenu
      className={full ? "w-full" : ""}
      direction={full ? "up" : "down"}
      align={full ? "left" : "right"}
      trigger={({ address, busy, onClick }) => (
        <Pill tone="dark" size="sm" onClick={onClick} disabled={busy} className={className}>
          <Image src="/brand/wallet.png" alt="" width={16} height={16} className="size-4" />
          {address ? <span className="font-mono text-[13px]">{shortAddress(address)}</span> : "Connect wallet"}
        </Pill>
      )}
    />
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const [left, setLeft] = useState(150);
  const [hot, setHot] = useState(0);
  // One highlight slides between the items instead of each item lighting up on its own.
  const [hl, setHl] = useState({ top: 0, left: 0, width: 0, height: 0, on: false, glide: false });
  const hlSeen = useRef(false);
  const moveHl = (el: HTMLElement) => {
    const glide = hlSeen.current;
    hlSeen.current = true;
    setHl({ top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight, on: true, glide });
  };
  const hideHl = () => {
    hlSeen.current = false;
    setHl((h) => ({ ...h, on: false, glide: false }));
  };

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
    // the panel sits under the button that opened it
    const b = triggers.current[id];
    const w = wrapRef.current;
    if (b && w) {
      const x = b.getBoundingClientRect().left - w.getBoundingClientRect().left - 12;
      setLeft(Math.max(0, Math.min(x, w.clientWidth - 640)));
    }
    setHot(0);
    if (open !== id) hideHl();
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
      <div ref={wrapRef} className="relative mx-auto max-w-[1280px] px-4 lg:px-6">
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
                    ref={(el) => {
                      triggers.current[m.id] = el;
                    }}
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
            className="absolute top-[calc(100%-4px)] hidden w-[640px] overflow-hidden rounded-2xl bg-[#101010] ring-1 ring-white/[0.07] transition-[left] duration-300 ease-[var(--ease-panel)] lg:block"
            style={{ left, animation: "menu-in 300ms var(--ease-panel) both" }}
          >
            <div className="grid grid-cols-[1fr_0.95fr]">
              <ul key={current.id} className="relative p-3" onMouseLeave={hideHl}>
                <li
                  aria-hidden
                  className="pointer-events-none absolute rounded-xl bg-white/[0.055]"
                  style={{
                    top: hl.top,
                    left: hl.left,
                    width: hl.width,
                    height: hl.height,
                    opacity: hl.on ? 1 : 0,
                    transition: hl.glide
                      ? "top 150ms cubic-bezier(0.16,1,0.3,1), left 150ms cubic-bezier(0.16,1,0.3,1), width 150ms cubic-bezier(0.16,1,0.3,1), height 150ms cubic-bezier(0.16,1,0.3,1), opacity 100ms ease"
                      : "opacity 100ms ease",
                  }}
                />
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
                    "relative block rounded-xl px-3 py-2.5";
                  const style = { animation: `pop 250ms var(--ease-expo) both`, animationDelay: `${i * 25}ms` };
                  return (
                    <li
                      key={it.t}
                      style={style}
                      onMouseEnter={(e) => {
                        setHot(i);
                        moveHl(e.currentTarget);
                      }}
                      onFocus={(e) => {
                        setHot(i);
                        moveHl(e.currentTarget);
                      }}
                    >
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
              <div className="m-3 ml-0 min-h-[210px] overflow-hidden rounded-xl bg-card">
                <div key={current.id} className="h-full">
                  <div key={hot} className="h-full" style={{ ["--tone" as string]: TONE[(current.items[hot] ?? current.items[0]).pv], animation: "fade 160ms ease-out both" }}>
                    <Preview id={(current.items[hot] ?? current.items[0]).pv} />
                  </div>
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
              <WalletButton className="w-full" full />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
