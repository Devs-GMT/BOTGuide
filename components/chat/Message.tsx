"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import type { Msg } from "@/lib/chats";
import { Cite } from "./Markdown";
import Markdown from "./Markdown";
import Mascot, { type Mood } from "../Mascot";
import SourceTrail from "./SourceTrail";
import VoteButtons from "./VoteButtons";
import {
  IconCheck,
  IconCopy,
  IconDoc,
  IconPlus,
  IconRefresh,
} from "./icons";

type Handlers = {
  onFollowUp: (q: string) => void;
  onRegenerate: () => void;
  onTip: () => void;
  onRetry: () => void;
};

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12.5px] text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
    >
      {children}
    </button>
  );
}

export function UserMessage({ msg }: { msg: Msg }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-[#2a2a2a] px-5 py-3 text-[15px] leading-7 sm:max-w-[75%]">
        {msg.content}
      </div>
    </div>
  );
}

export function AssistantMessage({ msg, question, isLast, handlers }: { msg: Msg; question: string; isLast: boolean; handlers: Handlers }) {
  const [copied, setCopied] = useState(false);
  const streaming = msg.status === "streaming";
  const waiting = streaming && !msg.content;
  const sources = msg.sources ?? [];
  // Show the sources the answer cites (keeping their numbers); before any citation, or on a fallback, show all.
  const cited = new Set([...msg.content.matchAll(/\[(\d)\]/g)].map((m) => Number(m[1])));
  const shownSources = sources
    .map((s, i) => ({ s, n: i + 1 }))
    .filter(({ n }) => msg.status === "error" || cited.size === 0 || cited.has(n));

  const mood: Mood = streaming ? "thinking" : msg.status === "error" || msg.kind === "not-found" ? "lost" : msg.status === "done" ? "done" : "idle";

  const copy = async () => {
    if (await copyText(msg.content)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex gap-4">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-card-hi text-white">
        <Mascot size={20} mood={mood} />
      </span>
      <div className="min-w-0 flex-1">
        {waiting && (
          <p className="flex items-center gap-2.5 py-1 text-[14px] text-muted" aria-live="polite">
            {msg.phase ?? "Thinking…"}
          </p>
        )}

        {!waiting && msg.kind === "answer" && shownSources.length > 0 && msg.status !== "error" && <SourceTrail items={shownSources} />}

        {msg.content && <Markdown text={msg.content} sources={sources} streaming={streaming} />}

        {msg.status === "stopped" && <p className="mt-2 text-[13px] text-muted">(stopped)</p>}

        {msg.status === "error" && (
          <button
            type="button"
            onClick={handlers.onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#0a0a0a] hover:bg-white/85"
          >
            <IconRefresh size={14} /> Retry
          </button>
        )}

        {msg.general && !streaming && (
          <p className="mt-3 inline-block rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-muted">
            Off the docs map: this part is general EVM knowledge
          </p>
        )}

        {msg.kind === "not-found" && msg.status === "done" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlers.onTip}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#0a0a0a] hover:bg-white/85"
            >
              <IconPlus size={14} /> Add a tip
            </button>
          </div>
        )}

        {shownSources.length > 0 && !waiting && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Sources">
            {shownSources.map(({ s, n }) => {
              const chip = (
                <>
                  <IconDoc size={13} />
                  <Cite n={n} />
                  <span>
                    {s.title} <span className="text-muted">· {s.section}</span>
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[10.5px] ${s.kind === "official" ? "bg-accent/15 text-accent" : "bg-white/10 text-white/65"}`}>
                    {s.kind === "official" ? "Official docs" : s.kind === "tip" ? "Community tip" : "Community note"}
                  </span>
                </>
              );
              const cls =
                "inline-flex items-center gap-2 rounded-full bg-card-hi px-3 py-1.5 text-[12.5px] text-white/85 ring-1 ring-white/[0.06]";
              return (
                <li key={s.id}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className={`${cls} transition-colors hover:bg-[#262626]`}>
                      {chip}
                    </a>
                  ) : (
                    <span className={cls}>{chip}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {msg.status === "done" && isLast && msg.followUps && msg.followUps.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {msg.followUps.slice(0, 3).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handlers.onFollowUp(q)}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-[13px] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {(msg.status === "done" || msg.status === "stopped") && msg.kind !== "refusal" && msg.kind !== "off-topic" && (
          <div className="-ml-2 mt-3 flex flex-wrap items-center gap-0.5">
            <VoteButtons question={question} answer={msg.content} />
            <ActionButton label="Copy answer" onClick={copy}>
              {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
              {copied && <span>Copied</span>}
            </ActionButton>
            {isLast && (
              <ActionButton label="Regenerate" onClick={handlers.onRegenerate}>
                <IconRefresh size={15} />
              </ActionButton>
            )}
            {msg.kind !== "not-found" && (
              <ActionButton label="Add a tip" onClick={handlers.onTip}>
                <IconPlus size={15} />
                <span>Add a tip</span>
              </ActionButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
