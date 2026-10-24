"use client";

import { useCallback, useEffect, useState } from "react";
import {
  contractReady,
  explainError,
  fetchRecentTips,
  fetchTip,
  fetchUpvoted,
  upvoteTip,
  type Tip,
} from "@/lib/contract";
import { useWallet } from "@/lib/wallet";
import { IconClose } from "./icons";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export default function TipsPanel({ focusId, onClose, onAdd }: { focusId: number | null; onClose: () => void; onAdd: () => void }) {
  const { address, connect, hasProvider } = useWallet();
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mine, setMine] = useState<Set<number>>(new Set());
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!contractReady) return setTips([]);
    try {
      let list = await fetchRecentTips(30);
      if (focusId !== null) {
        const t = focusId >= 0 ? await fetchTip(focusId) : null;
        if (!t) setMissing(true);
        else list = [t, ...list.filter((x) => x.id !== t.id)];
      }
      setTips(list);
      if (address && list.length) setMine(await fetchUpvoted(list.map((t) => t.id), address));
    } catch {
      setFailed(true);
      setTips([]);
    }
  }, [focusId, address]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const upvote = async (t: Tip) => {
    if (!address) {
      if (!hasProvider) return setNote("Install MetaMask to upvote.");
      return connect();
    }
    setBusyId(t.id);
    try {
      await upvoteTip(t.id, (s) => setNote(s === "confirm" ? "Confirm in wallet…" : "Waiting for confirmation…"));
      setNote("Upvoted.");
      await load();
    } catch (e) {
      setNote(explainError(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="tips-title" className="flex max-h-[85dvh] w-full max-w-[560px] flex-col rounded-t-3xl bg-[#121212] p-6 ring-1 ring-white/[0.08] sm:rounded-3xl" style={{ animation: "pop 220ms var(--ease-panel) both" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="tips-title" className="text-[20px] font-medium tracking-[-0.01em]">Community tips</h2>
            <p className="mt-1 text-[13px] leading-5 text-muted">Only approved tips reach the AI. Pending ones are waiting for the owner.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-full bg-pill text-white/80 hover:text-white">
            <IconClose size={14} />
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto">
          {missing && <p className="rounded-xl bg-white/[0.05] px-4 py-3 text-[13px] text-white/80">Tip not found.</p>}
          {tips === null && <p className="text-[13px] text-muted">Loading…</p>}
          {tips && tips.length === 0 && !missing && (
            <p className="text-[13px] text-muted">
              {!contractReady ? "Tips open once the BOTGuide contract is deployed." : failed ? "Couldn't load tips. Try again later." : "No tips yet."}
            </p>
          )}
          {tips?.map((t) => {
            const own = address?.toLowerCase() === t.author.toLowerCase();
            const done = mine.has(t.id);
            return (
              <article key={t.id} className={`rounded-2xl bg-card p-4 ring-1 ${t.id === focusId ? "ring-white/40" : "ring-white/[0.06]"}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[14.5px] font-medium">{t.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${t.approved ? "bg-[#1d3a27] text-[#7ee29b]" : "bg-white/10 text-white/65"}`}>
                    {t.approved ? "Approved" : "Pending review"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-[13.5px] leading-6 text-white/80">{t.body}</p>
                <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
                  <span>{t.section} · {short(t.author)}</span>
                  <button
                    type="button"
                    disabled={busyId === t.id || done || own}
                    title={own ? "You can't upvote your own tip" : done ? "You already upvoted" : "Upvote"}
                    onClick={() => upvote(t)}
                    className="rounded-full bg-pill px-3 py-1 text-white/85 hover:bg-[#333] disabled:opacity-40 disabled:hover:bg-pill"
                  >
                    ▲ {t.upvotes}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {note && <p role="status" className="mt-3 text-[12.5px] text-white/70">{note}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full bg-pill px-5 py-2.5 text-[14px] font-medium hover:bg-[#333]">Close</button>
          <button type="button" onClick={onAdd} className="rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#0a0a0a]">Add a tip</button>
        </div>
      </div>
    </div>
  );
}
