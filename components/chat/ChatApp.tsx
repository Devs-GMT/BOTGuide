"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { STARTERS, streamAnswer, type HistoryItem } from "@/lib/answer";
import { copyText } from "@/lib/clipboard";
import { loadChats, loadSettings, saveChats, saveSettings, titleFrom, uid, type Chat, type Msg } from "@/lib/chats";
import Mascot from "../Mascot";
import Composer from "./Composer";
import FactsPanel from "./FactsPanel";
import { IconMenu, IconPanel, IconShare, IconSidebar } from "./icons";
import { AssistantMessage, UserMessage } from "./Message";
import Sidebar from "./Sidebar";
import TipModal from "./TipModal";
import TipsPanel from "./TipsPanel";

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const NO_MESSAGES: Msg[] = [];
const MENTIONS_FACTS =/\b(677|968)\b|rpc\.|scan\.|bohr\.life/i;

export default function ChatApp() {
  const [initial] = useState(() => {
    const l = loadChats();
    return { chats: l ?? [], off: l === null };
  });
  const [chats, setChats] = useState<Chat[]>(initial.chats);
  const [historyOff, setHistoryOff] = useState(initial.off);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [factsPref, setFactsPref] = useState(() => loadSettings().factsOpen);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [focusTip, setFocusTip] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState("0");

  const isXl = useMedia("(min-width: 1280px)");

  const abortRef = useRef<AbortController | null>(null);
  const chatsRef = useRef(chats);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didQuery = useRef(false);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeId) ?? null;
  const messages = activeChat?.messages ?? NO_MESSAGES;
  const streaming = streamingId !== null;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const factsHint = !!lastAssistant && MENTIONS_FACTS.test(lastAssistant.content);

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  /* ---------- persistence ---------- */
  useEffect(() => {
    if (historyOff) return;
    const t = setTimeout(() => {
      if (!saveChats(chats)) setHistoryOff(true);
    }, 300);
    return () => clearTimeout(t);
  }, [chats, historyOff]);

  /* ---------- chat state helpers ---------- */
  const patchMsg = useCallback((chatId: string, msgId: string, fn: (m: Msg) => Msg) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, updatedAt: Date.now(), messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) } : c,
      ),
    );
  }, []);

  const run = useCallback(
    async (chatId: string, assistantId: string, question: string, history: HistoryItem[]) => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setStreamingId(assistantId);
      stick.current = true;
      try {
        for await (const ev of streamAnswer({ question, history, signal: ctrl.signal })) {
          if (ev.type === "status") patchMsg(chatId, assistantId, (m) => ({ ...m, phase: ev.text }));
          else if (ev.type === "meta")
            patchMsg(chatId, assistantId, (m) => ({ ...m, kind: ev.kind, sources: ev.sources, general: ev.general }));
          else if (ev.type === "text") patchMsg(chatId, assistantId, (m) => ({ ...m, content: ev.text }));
          else if (ev.type === "done")
            patchMsg(chatId, assistantId, (m) => ({ ...m, status: "done", followUps: ev.followUps }));
          else if (ev.type === "fallback")
            patchMsg(chatId, assistantId, (m) => ({
              ...m,
              content: ev.text,
              sources: ev.sources,
              kind: "answer",
              status: "error",
            }));
        }
        patchMsg(chatId, assistantId, (m) => (m.status === "streaming" ? { ...m, status: "done" } : m));
      } catch (e) {
        const aborted = e instanceof DOMException && e.name === "AbortError";
        patchMsg(chatId, assistantId, (m) => ({ ...m, status: aborted ? "stopped" : "error" }));
      } finally {
        if (abortRef.current === ctrl) {
          abortRef.current = null;
          setStreamingId(null);
        }
      }
    },
    [patchMsg],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const send = useCallback(
    (text: string) => {
      if (abortRef.current) return;
      const now = Date.now();
      const user: Msg = { id: uid(), role: "user", content: text, at: now };
      const assistant: Msg = { id: uid(), role: "assistant", content: "", at: now, status: "streaming" };
      const existing = chatsRef.current.find((c) => c.id === activeId);
      const history = (existing?.messages ?? []).slice(-6).map(({ role, content }) => ({ role, content }));
      let chatId = existing?.id;
      if (existing) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === existing.id ? { ...c, updatedAt: now, messages: [...c.messages, user, assistant] } : c,
          ),
        );
      } else {
        chatId = uid();
        const chat: Chat = { id: chatId, title: titleFrom(text), createdAt: now, updatedAt: now, messages: [user, assistant] };
        setChats((prev) => [chat, ...prev]);
        setActiveId(chatId);
      }
      void run(chatId!, assistant.id, text, history);
    },
    [activeId, run],
  );

  const regenerate = useCallback(() => {
    const chat = chatsRef.current.find((c) => c.id === activeId);
    if (abortRef.current || !chat) return;
    const msgs = chat.messages;
    const last = msgs[msgs.length - 1];
    const question = msgs[msgs.length - 2];
    if (!last || last.role !== "assistant" || !question || question.role !== "user") return;
    const history = msgs.slice(0, -2).slice(-6).map(({ role, content }) => ({ role, content }));
    const fresh: Msg = { id: uid(), role: "assistant", content: "", at: Date.now(), status: "streaming" };
    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, messages: [...c.messages.slice(0, -1), fresh] } : c)),
    );
    void run(chat.id, fresh.id, question.content, history);
  }, [activeId, run]);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setActiveId(null);
    setDrawer(false);
    setFocusKey(`new-${Date.now()}`);
  }, []);

  const selectChat = useCallback((id: string) => {
    abortRef.current?.abort();
    setActiveId(id);
    setDrawer(false);
    setFocusKey(id);
    stick.current = true;
  }, []);

  /* ---------- ?q= share links ---------- */
  useEffect(() => {
    if (didQuery.current) return;
    didQuery.current = true;
    const q = new URLSearchParams(window.location.search).get("q")?.trim().slice(0, 1000);
    const tip = new URLSearchParams(window.location.search).get("tip");
    if (q) {
      window.history.replaceState(null, "", "/ask");
      send(q);
    } else if (tip !== null) {
      window.history.replaceState(null, "", "/ask");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      // ?tip=all (the landing page's "Add a tip" link) opens the panel without pointing at one tip
      setFocusTip(tip === "" || tip === "all" ? null : /^\d{1,9}$/.test(tip) ? Number(tip) : -1);
      setTipsOpen(true);
    }
  }, [send]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        newChat();
      } else if (e.key === "Escape" && !tipOpen && !tipsOpen) {
        abortRef.current?.abort();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newChat, tipOpen, tipsOpen]);

  /* ---------- scrolling ---------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (messages.length === 0) el.scrollTop = 0;
    else if (stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, activeId]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  /* ---------- actions ---------- */
  const share = async () => {
    const first = messages.find((m) => m.role === "user");
    if (!first) return;
    const url = `${window.location.origin}/ask?q=${encodeURIComponent(first.content)}`;
    showToast((await copyText(url)) ? "Link copied" : "Couldn't copy the link");
  };

  const toggleFacts = () => {
    if (isXl) {
      const next = !factsPref;
      setFactsPref(next);
      saveSettings({ factsOpen: next });
    } else {
      setSheet(true);
    }
  };

  const sidebarProps = {
    chats,
    activeId,
    historyOff,
    search,
    onSearch: setSearch,
    onSelect: selectChat,
    onNew: newChat,
    onRename: (id: string, title: string) =>
      setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c))),
    onDelete: (id: string) => {
      if (id === activeId) {
        abortRef.current?.abort();
        setActiveId(null);
      }
      setChats((prev) => prev.filter((c) => c.id !== id));
    },
    onClearAll: () => {
      abortRef.current?.abort();
      setActiveId(null);
      setChats([]);
    },
    factsOpen: factsPref,
    onToggleFacts: toggleFacts,
    onTips: () => {
      setFocusTip(null);
      setTipsOpen(true);
      setDrawer(false);
    },
  };

  const handlers = {
    onFollowUp: send,
    onRegenerate: regenerate,
    onRetry: regenerate,
    onTip: () => setTipOpen(true),
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-white">
      <aside
        className={`hidden shrink-0 overflow-hidden border-line transition-[width] duration-300 ease-[var(--ease-panel)] lg:block ${sidebarCollapsed ? "w-0 border-r-0" : "w-[260px] border-r"}`}
      >
        <div className="h-full w-[260px]">
          <Sidebar {...sidebarProps} />
        </div>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Chats">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[300px] max-w-[88vw] shadow-2xl" style={{ animation: "menu-in 240ms var(--ease-panel) both" }}>
            <Sidebar {...sidebarProps} />
          </div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-3">
          <button type="button" aria-label="Open chats" onClick={() => setDrawer(true)} className="grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/[0.07] lg:hidden">
            <IconMenu size={18} />
          </button>
          <button
            type="button"
            aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="hidden size-9 place-items-center rounded-lg text-muted hover:bg-white/[0.07] hover:text-white lg:grid"
          >
            <IconSidebar size={18} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[14px] font-medium text-white/90">{activeChat?.title ?? "New chat"}</h1>
          {activeChat && messages.some((m) => m.role === "user") && (
            <button type="button" onClick={share} className="flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] text-white/80 hover:bg-white/[0.07] hover:text-white">
              <IconShare size={15} /> <span className="hidden sm:inline">Share</span>
            </button>
          )}
          <button
            type="button"
            aria-label="Network facts"
            aria-pressed={isXl ? factsPref : sheet}
            onClick={toggleFacts}
            className={`grid size-9 place-items-center rounded-lg hover:bg-white/[0.07] ${isXl && factsPref ? "text-white" : "text-muted hover:text-white"}`}
          >
            <IconPanel size={18} />
          </button>
        </header>

        <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-full w-full max-w-[768px] flex-col items-center justify-center px-4 py-10">
              <span className="text-white"><Mascot mood="hello" size={76} /></span>
              <h2 className="mt-6 text-center text-[clamp(1.6rem,3.4vw,2.25rem)] font-medium leading-tight tracking-[-0.02em]">
                What do you want to build on BOT Chain today?
              </h2>
              <p className="mt-3 max-w-[30rem] text-center text-[14.5px] leading-6 text-muted">
                I answer from the official docs, and I show you where each answer comes from.
              </p>
              <div className="mt-8 grid w-full grid-cols-2 gap-2.5 sm:mt-10 sm:gap-3">
                {STARTERS.map(([title, sub], i) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => send(title)}
                    className="pop-in rounded-2xl bg-card p-3.5 text-left ring-1 ring-white/[0.06] transition-colors duration-150 hover:bg-card-hi sm:p-4"
                    style={{ ["--d" as string]: `${i * 45}ms` }}
                  >
                    <span className="block text-[14px] font-medium leading-5 sm:text-[14.5px]">{title}</span>
                    <span className="mt-1 hidden text-[12.5px] text-muted sm:block">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-[768px] space-y-9 px-4 py-8">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <UserMessage key={m.id} msg={m} />
                ) : (
                  <AssistantMessage key={m.id} msg={m} question={messages[i - 1]?.role === "user" ? messages[i - 1].content : ""} isLast={i === messages.length - 1} handlers={handlers} />
                ),
              )}
            </div>
          )}
        </div>

        <Composer streaming={streaming} onSend={send} onStop={stop} focusKey={focusKey} />
      </main>

      {isXl && factsPref && (
        <aside className="w-[320px] shrink-0 border-l border-line bg-[#0f0f0f]" aria-label="Network facts">
          <FactsPanel highlight={factsHint} onClose={toggleFacts} />
        </aside>
      )}

      {sheet && !isXl && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Network facts">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-hidden rounded-t-3xl bg-[#101010] ring-1 ring-white/[0.08] sm:inset-x-auto sm:right-0 sm:top-0 sm:max-h-none sm:w-[360px] sm:rounded-none" style={{ animation: "menu-in 260ms var(--ease-panel) both" }}>
            <FactsPanel highlight={factsHint} onClose={() => setSheet(false)} />
          </div>
        </div>
      )}

      {tipsOpen && (
        <TipsPanel
          focusId={focusTip}
          onClose={() => setTipsOpen(false)}
          onAdd={() => {
            setTipsOpen(false);
            setTipOpen(true);
          }}
        />
      )}
      {tipOpen && <TipModal onClose={() => setTipOpen(false)} />}

      {toast && (
        <div role="status" className="pointer-events-none fixed inset-x-0 bottom-28 z-[70] flex justify-center px-4">
          <p className="pop-in flex max-w-md items-center gap-3 rounded-full bg-white px-5 py-3 text-[13.5px] font-medium text-[#0a0a0a] shadow-2xl">{toast}</p>
        </div>
      )}
    </div>
  );
}
