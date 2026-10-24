"use client";

import { useEffect, useRef, useState } from "react";
import { IconStop, IconUp } from "./icons";

const LIMIT = 1000;

export default function Composer({
  streaming,
  onSend,
  onStop,
  focusKey,
}: {
  streaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  focusKey: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Focus the box on a new chat or when switching chats.
  useEffect(() => {
    ref.current?.focus();
  }, [focusKey]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const over = value.length > LIMIT;
  const canSend = value.trim().length > 0 && !over && !streaming;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="mx-auto w-full max-w-[768px] px-4 pb-4 pt-2">
      <div className="flex items-end gap-2 rounded-3xl bg-card py-2.5 pl-5 pr-2.5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.08] transition-shadow focus-within:ring-white/25">
        <label htmlFor="composer" className="sr-only">
          Message BOTGuide
        </label>
        <textarea
          id="composer"
          ref={ref}
          rows={1}
          value={value}
          placeholder="Message BOTGuide…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-white outline-none placeholder:text-muted"
        />
        {value.length > 800 && (
          <span className={`mb-2.5 shrink-0 font-mono text-[11.5px] ${over ? "text-[#ff6b6b]" : "text-muted"}`} aria-live="polite">
            {value.length}/{LIMIT}
          </span>
        )}
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#0a0a0a] transition-colors hover:bg-white/85"
          >
            <IconStop />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#0a0a0a] transition-opacity duration-150 disabled:opacity-25"
          >
            <IconUp size={17} />
          </button>
        )}
      </div>
      <p className="mt-2.5 text-center text-[11.5px] leading-5 text-muted">
        BOTGuide answers from the BOT Chain docs and can make mistakes. Check important details.
      </p>
    </div>
  );
}
