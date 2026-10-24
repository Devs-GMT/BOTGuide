"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DOCS_LAST_SYNCED, LINKS, MAINNET, MAINNET_CONTRACT_ADDRESS, TESTNET, shortAddress } from "@/lib/config";
import type { Chat } from "@/lib/chats";
import { groupChats } from "@/lib/chats";
import { addNetwork, useChainId, useWallet } from "@/lib/wallet";
import { Logo } from "../ui";
import {
  IconBack,
  IconMore,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSettings,
  IconTrash,
} from "./icons";

type Props = {
  chats: Chat[];
  activeId: string | null;
  historyOff: boolean;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  factsOpen: boolean;
  onToggleFacts: () => void;
  onTips: () => void;
};

function ChatRow({
  chat,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  chat: Chat;
  active: boolean;
  onSelect: () => void;
  onRename: (t: string) => void;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [draft, setDraft] = useState(chat.title);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setMenu(false);
        setConfirm(false);
      }
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menu]);

  if (renaming) {
    return (
      <form
        className="px-1"
        onSubmit={(e) => {
          e.preventDefault();
          onRename(draft.trim() || chat.title);
          setRenaming(false);
        }}
      >
        <input
          autoFocus
          value={draft}
          maxLength={60}
          aria-label="Chat name"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => setRenaming(false)}
          onKeyDown={(e) => e.key === "Escape" && setRenaming(false)}
          className="w-full rounded-lg bg-[#1f1f1f] px-3 py-2 text-[13.5px] outline-none ring-1 ring-white/25"
        />
      </form>
    );
  }

  return (
    <div ref={ref} className="group relative">
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={`w-full truncate rounded-lg px-3 py-2 pr-9 text-left text-[13.5px] transition-colors duration-150 ${active ? "bg-[#1f1f1f] text-white" : "text-white/75 hover:bg-white/[0.05] hover:text-white"}`}
      >
        {chat.title}
      </button>
      <button
        type="button"
        aria-label={`Options for ${chat.title}`}
        aria-expanded={menu}
        onClick={() => setMenu((m) => !m)}
        className={`absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-white/10 hover:text-white ${menu ? "opacity-100" : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100"}`}
      >
        <IconMore size={15} />
      </button>
      {menu && (
        <div className="absolute right-1 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl bg-[#171717] p-1 text-[13px] shadow-xl ring-1 ring-white/10" style={{ animation: "pop 160ms var(--ease-panel) both" }}>
          {confirm ? (
            <div className="p-2">
              <p className="mb-2 text-white/80">Delete this chat?</p>
              <div className="flex gap-2">
                <button type="button" onClick={onDelete} className="flex-1 rounded-lg bg-[#3b1e22] py-1.5 text-[#ff8a98] hover:bg-[#4a2429]">
                  Delete
                </button>
                <button type="button" onClick={() => setConfirm(false)} className="flex-1 rounded-lg bg-white/10 py-1.5 hover:bg-white/15">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setDraft(chat.title);
                  setRenaming(true);
                  setMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left hover:bg-white/[0.07]"
              >
                <IconPencil size={14} /> Rename
              </button>
              <button type="button" onClick={() => setConfirm(true)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[#ff8a98] hover:bg-white/[0.07]">
                <IconTrash size={14} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NetworkBadge() {
  const chainId = useChainId();
  const { address } = useWallet();
  const [busy, setBusy] = useState(false);

  if (address && chainId !== null && chainId !== MAINNET.chainId && chainId !== TESTNET.chainId) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await addNetwork(MAINNET);
          } catch {
            /* rejected */
          }
          setBusy(false);
        }}
        className="rounded-full bg-[#3b2a1e] px-2.5 py-1 text-[11.5px] text-[#f0a35e] hover:bg-[#4a3424]"
      >
        Switch to BOT Chain
      </button>
    );
  }
  const net = chainId === TESTNET.chainId ? "Testnet" : "Mainnet";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11.5px] text-white/80">
      <span className={`size-1.5 rounded-full ${address ? "bg-[#5ecb7f]" : "bg-white/40"}`} />
      {net}
    </span>
  );
}

function WalletChip() {
  const { hasProvider, address, busy, connect } = useWallet();
  if (!hasProvider) {
    return (
      <a href={LINKS.metamask} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-pill px-3 py-2.5 text-[13px] hover:bg-[#333]">
        <Image src="/brand/wallet.png" alt="" width={16} height={16} className="size-4" />
        Install MetaMask
      </a>
    );
  }
  return (
    <button type="button" onClick={connect} disabled={busy || !!address} className="flex items-center gap-2 rounded-xl bg-pill px-3 py-2.5 text-[13px] hover:bg-[#333] disabled:hover:bg-pill">
      <Image src="/brand/wallet.png" alt="" width={16} height={16} className="size-4" />
      {address ? <span className="font-mono text-[12.5px]">{shortAddress(address)}</span> : "Connect wallet"}
    </button>
  );
}

export default function Sidebar(p: Props) {
  const [settings, setSettings] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings) return;
    const close = (e: MouseEvent) => {
      if (!settingsRef.current?.contains(e.target as Node)) {
        setSettings(false);
        setConfirmClear(false);
      }
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [settings]);

  const q = p.search.trim().toLowerCase();
  const filtered = q
    ? p.chats.filter((c) => c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q)))
    : p.chats;
  const groups = groupChats(filtered);

  return (
    <div className="flex h-full w-full flex-col bg-[#0f0f0f]">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <Link href="/" aria-label="BOTGuide home" className="text-white">
          <Logo />
        </Link>
        <Link href="/" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12.5px] text-muted transition-colors hover:bg-white/[0.06] hover:text-white">
          <IconBack size={13} /> Back to site
        </Link>
      </div>

      <div className="space-y-2 px-3">
        <button
          type="button"
          onClick={p.onNew}
          className="flex w-full items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-[14px] font-medium text-[#0a0a0a] transition-colors hover:bg-white/85"
        >
          <IconPlus size={16} /> New chat
          <kbd className="ml-auto hidden rounded bg-black/10 px-1.5 font-mono text-[10.5px] text-black/60 lg:block">Ctrl K</kbd>
        </button>
        <label className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3 py-2 text-muted focus-within:ring-1 focus-within:ring-white/25">
          <IconSearch size={14} />
          <span className="sr-only">Search chats</span>
          <input
            value={p.search}
            onChange={(e) => p.onSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-transparent text-[13.5px] text-white outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <nav aria-label="Chat history" className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {p.historyOff && (
          <p className="mx-2 mt-2 rounded-lg bg-white/[0.05] px-3 py-2.5 text-[12.5px] leading-5 text-muted">
            History is off in this browser. Chats last until you close this tab.
          </p>
        )}
        {groups.length === 0 && !p.historyOff && (
          <p className="px-3 py-4 text-[13px] text-muted">{q ? "No chats match." : "Your chats will appear here."}</p>
        )}
        {groups.map((g) => (
          <div key={g.label} className="mt-3 first:mt-0">
            <p className="px-3 pb-1.5 pt-2 text-[11.5px] uppercase tracking-wider text-muted">{g.label}</p>
            <div className="space-y-0.5">
              {g.chats.map((c) => (
                <ChatRow
                  key={c.id}
                  chat={c}
                  active={c.id === p.activeId}
                  onSelect={() => p.onSelect(c.id)}
                  onRename={(t) => p.onRename(c.id, t)}
                  onDelete={() => p.onDelete(c.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-line px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <WalletChip />
          <NetworkBadge />
        </div>
        <div className="flex items-center justify-between">
          <p className="px-1 text-[11.5px] text-muted">
            Docs last synced: {DOCS_LAST_SYNCED ?? "not synced yet"}
          </p>
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              aria-label="Settings"
              aria-expanded={settings}
              onClick={() => setSettings((s) => !s)}
              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/[0.07] hover:text-white"
            >
              <IconSettings size={16} />
            </button>
            {settings && (
              <div className="absolute bottom-full right-0 z-30 mb-2 w-60 overflow-hidden rounded-xl bg-[#171717] p-1 text-[13px] shadow-xl ring-1 ring-white/10" style={{ animation: "pop 160ms var(--ease-panel) both" }}>
                <button type="button" onClick={p.onTips} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/[0.07]">
                  Community tips
                </button>
                <button type="button" onClick={p.onToggleFacts} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/[0.07]">
                  Network facts panel
                  <span className="text-muted">{p.factsOpen ? "Shown" : "Hidden"}</span>
                </button>
                <a href={LINKS.site} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 hover:bg-white/[0.07]">
                  BOT Chain
                </a>
                <a
                  href={MAINNET_CONTRACT_ADDRESS ? `${MAINNET.explorer}/address/${MAINNET_CONTRACT_ADDRESS}` : MAINNET.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg px-3 py-2 hover:bg-white/[0.07]"
                >
                  Explorer
                </a>
                <div className="my-1 border-t border-white/[0.08]" />
                {confirmClear ? (
                  <div className="p-2">
                    <p className="mb-2 text-white/80">Delete all chats?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          p.onClearAll();
                          setConfirmClear(false);
                          setSettings(false);
                        }}
                        className="flex-1 rounded-lg bg-[#3b1e22] py-1.5 text-[#ff8a98] hover:bg-[#4a2429]"
                      >
                        Delete
                      </button>
                      <button type="button" onClick={() => setConfirmClear(false)} className="flex-1 rounded-lg bg-white/10 py-1.5 hover:bg-white/15">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmClear(true)} className="block w-full rounded-lg px-3 py-2 text-left text-[#ff8a98] hover:bg-white/[0.07]">
                    Clear all chats
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
