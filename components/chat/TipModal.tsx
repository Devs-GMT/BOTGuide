"use client";

import { useEffect, useRef, useState } from "react";
import { contractReady, explainError, submitTip } from "@/lib/contract";
import { useWallet } from "@/lib/wallet";
import { IconClose } from "./icons";

const SECTIONS = ["Network", "Deploy", "Tools", "Errors", "Other"] as const;

export default function TipModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Other");
  const first = useRef<HTMLInputElement>(null);
  const live = contractReady;
  const { hasProvider, address, connect } = useWallet();
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    if (!address) return connect();
    setSending(true);
    try {
      const id = await submitTip({ title, body, section }, (st) =>
        setStatus(st === "confirm" ? "Confirm in wallet…" : "Waiting for confirmation…"),
      );
      setDone(id);
      setStatus("");
    } catch (e) {
      setStatus(explainError(e));
    } finally {
      setSending(false);
    }
  };

  const valid = title.trim().length > 0 && body.trim().length > 0 && body.length <= 500;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="tip-title" className="max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl bg-[#121212] p-6 ring-1 ring-white/[0.08] sm:rounded-3xl" style={{ animation: "pop 220ms var(--ease-panel) both" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="tip-title" className="text-[20px] font-medium tracking-[-0.01em]">Add a tip</h2>
            <p className="mt-1 text-[13px] leading-5 text-muted">
              Share something that helped you build on BOT Chain. Tips are reviewed by the owner before they reach the AI.
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-full bg-pill text-white/80 hover:text-white">
            <IconClose size={14} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="tip-t" className="mb-1.5 block text-[12.5px] text-muted">Title</label>
            <input
              id="tip-t"
              ref={first}
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-card px-4 py-3 text-[14px] outline-none ring-1 ring-white/[0.08] focus:ring-white/30"
            />
          </div>
          <div>
            <label htmlFor="tip-b" className="mb-1.5 flex justify-between text-[12.5px] text-muted">
              <span>Tip</span>
              <span className={`font-mono ${body.length > 500 ? "text-[#ff6b6b]" : ""}`}>{body.length}/500</span>
            </label>
            <textarea
              id="tip-b"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full resize-none rounded-xl bg-card px-4 py-3 text-[14px] leading-6 outline-none ring-1 ring-white/[0.08] focus:ring-white/30"
            />
          </div>
          <div>
            <label htmlFor="tip-s" className="mb-1.5 block text-[12.5px] text-muted">Section</label>
            <select
              id="tip-s"
              value={section}
              onChange={(e) => setSection(e.target.value as (typeof SECTIONS)[number])}
              className="w-full rounded-xl bg-card px-4 py-3 text-[14px] outline-none ring-1 ring-white/[0.08] focus:ring-white/30"
            >
              {SECTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {done !== undefined && (
          <p role="status" className="mt-4 rounded-xl bg-white/[0.05] px-4 py-3 text-[12.5px] leading-5 text-white/80">
            Tip submitted{done !== null ? ` (#${done})` : ""}. Status: Pending review. It reaches the AI only after the owner approves it.
          </p>
        )}
        {status && (
          <p role="status" className="mt-4 text-[12.5px] leading-5 text-white/70">
            {status}
          </p>
        )}
        {!live && (
          <p className="mt-4 rounded-xl bg-white/[0.05] px-4 py-3 text-[12.5px] leading-5 text-white/70">
            Submitting a tip is a transaction on BOT Chain. It opens once the BOTGuide contract is deployed.
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full bg-pill px-5 py-2.5 text-[14px] font-medium hover:bg-[#333]">
            Close
          </button>
          <button type="button" onClick={submit} disabled={!live || !valid || sending || done !== undefined || (!address && !hasProvider)} className="rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#0a0a0a] disabled:opacity-30">
            {address ? "Submit tip" : "Connect wallet"}
          </button>
        </div>
      </div>
    </div>
  );
}
