"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { Source } from "@/lib/search";
import { copyText } from "@/lib/clipboard";
import { highlight } from "../highlight";
import { Window } from "../ui";
import { IconCheck, IconCopy } from "./icons";

type Block =
  | { t: "p"; text: string }
  | { t: "ol" | "ul"; items: string[]; start?: number }
  | { t: "code"; lang: string; code: string };

const OL = /^\s*\d+\.\s/;
const UL = /^\s*[-*]\s/;

function parse(src: string): Block[] {
  const lines = src.split("\n");
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      i++; // closing fence (or end of a still-streaming block)
      out.push({ t: "code", lang: fence[1], code: code.join("\n") });
      continue;
    }
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    if (OL.test(line) || UL.test(line)) {
      const re = OL.test(line) ? OL : UL;
      const start = re === OL ? Number(line.match(/\d+/)?.[0]) : undefined;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, ""));
      out.push({ t: re === OL ? "ol" : "ul", items, start });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !OL.test(lines[i]) &&
      !UL.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    out.push({ t: "p", text: para.join(" ") });
  }
  return out;
}

export function Cite({ n, source }: { n: number; source?: Source }) {
  const cls =
    "mx-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded bg-white/10 px-1 align-baseline font-mono text-[10.5px] text-white/80 transition-colors hover:bg-white hover:text-[#0a0a0a]";
  return source ? (
    <a href={source.url} target="_blank" rel="noopener noreferrer" title={`${source.title} · ${source.section}`} className={cls}>
      {n}
    </a>
  ) : (
    <span className={cls}>{n}</span>
  );
}

function inline(text: string, sources: Source[] | undefined, keyBase: string): ReactNode[] {
  const parts = text.split(
    /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[\d\]|\[[^\]]+\]\([^)]+\)|<https?:\/\/[^>\s]+>|https?:\/\/[^\s)<>\]]+)/g,
  );
  return parts.map((p, i) => {
    const key = `${keyBase}-${i}`;
    if (!p) return null;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2)
      return (
        <code key={key} className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.86em] text-white">
          {p.slice(1, -1)}
        </code>
      );
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={key} className="font-semibold text-white">{p.slice(2, -2)}</strong>;
    if (/^\*[^*]/.test(p) && p.endsWith("*")) return <em key={key}>{p.slice(1, -1)}</em>;
    const cite = p.match(/^\[(\d)\]$/);
    if (cite) return <Cite key={key} n={Number(cite[1])} source={sources?.[Number(cite[1]) - 1]} />;
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link)
      return (
        <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="underline decoration-white/40 underline-offset-4 hover:decoration-white">
          {link[1]}
        </a>
      );
    const bare = p.match(/^<?(https?:\/\/[^>\s]+?)>?$/);
    if (bare) {
      const url = bare[1].replace(/[.,;:]+$/, "");
      const tail = bare[1].slice(url.length);
      return (
        <Fragment key={key}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="break-all underline decoration-white/40 underline-offset-4 hover:decoration-white">
            {url.replace(/^https?:\/\//, "")}
          </a>
          {tail}
        </Fragment>
      );
    }
    return <Fragment key={key}>{p}</Fragment>;
  });
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  const copy = async () => {
    setState((await copyText(code)) ? "ok" : "fail");
    setTimeout(() => setState("idle"), 1800);
  };
  return (
    <Window
      title={lang || "text"}
      className="my-4"
      right={
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted transition-colors hover:text-white"
        >
          {state === "ok" ? <IconCheck size={13} /> : <IconCopy size={13} />}
          <span aria-live="polite">{state === "ok" ? "Copied" : state === "fail" ? "Copy failed" : "Copy"}</span>
        </button>
      }
    >
      <pre className="overflow-x-auto px-4 pb-4 pt-1 font-mono text-[12.5px] leading-6 text-white/90">
        <code>{highlight(code)}</code>
      </pre>
    </Window>
  );
}

export default function Markdown({
  text,
  sources,
  streaming,
}: {
  text: string;
  sources?: Source[];
  streaming?: boolean;
}) {
  const blocks = parse(text);
  return (
    <div className={`text-[15px] leading-[1.75] text-white/90 ${streaming ? "stream-caret" : ""}`}>
      {blocks.map((b, i) => {
        if (b.t === "code") return <CodeBlock key={i} lang={b.lang} code={b.code} />;
        if (b.t === "p")
          return (
            <p key={i} className="my-3 first:mt-0">
              {inline(b.text, sources, `p${i}`)}
            </p>
          );
        const List = b.t === "ol" ? "ol" : "ul";
        return (
          <List
            key={i}
            start={b.t === "ol" ? b.start : undefined}
            className={`my-3 space-y-1.5 pl-6 ${b.t === "ol" ? "list-decimal" : "list-disc"} marker:text-muted`}
          >
            {b.items.map((it, j) => (
              <li key={j} className="pl-1">
                {inline(it, sources, `l${i}-${j}`)}
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}
