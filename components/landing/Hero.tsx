"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DOCS_LAST_SYNCED_SHORT, LINKS } from "@/lib/config";
import { useReducedMotion } from "@/lib/hooks";
import { Arrow, External, Pill } from "../ui";

const LINE_1 = ["Everything", "you", "need"];
const LINE_2 = ["to", "build", "on", "BOT", "Chain."];

const PLACEHOLDERS = [
  "How do I add BOT Chain to MetaMask?",
  "Deploy a contract with Hardhat",
  "What is the RPC URL for testnet?",
  "Why did my transaction revert?",
  "How do I verify a contract?",
];

const CHIPS = ["Add BOT Chain to MetaMask", "Deploy with Remix", "Get testnet BOT"];

/** Types example questions into the placeholder while the box is idle. */
function useTypingPlaceholder(idle: boolean) {
  const reduced = useReducedMotion();
  const [text, setText] = useState(PLACEHOLDERS[0]);

  useEffect(() => {
    if (!idle || reduced) return;
    let i = 0;
    let n = 0;
    let dir: 1 | -1 = 1;
    let id: ReturnType<typeof setTimeout>;
    const step = () => {
      const full = PLACEHOLDERS[i];
      n += dir;
      setText(full.slice(0, n));
      if (dir === 1 && n >= full.length) {
        dir = -1;
        id = setTimeout(step, 1900);
      } else if (dir === -1 && n <= 0) {
        dir = 1;
        i = (i + 1) % PLACEHOLDERS.length;
        id = setTimeout(step, 350);
      } else {
        id = setTimeout(step, dir === 1 ? 42 : 16);
      }
    };
    n = PLACEHOLDERS[0].length;
    dir = -1;
    id = setTimeout(step, 1800);
    return () => {
      clearTimeout(id);
      setText(PLACEHOLDERS[0]);
    };
  }, [idle, reduced]);

  return idle && !reduced ? text : PLACEHOLDERS[0];
}

function AskBox() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const placeholder = useTypingPlaceholder(!focused && value === "");

  const send = (q: string) => {
    const text = q.trim().slice(0, 1000);
    if (!text) return;
    router.push(`/ask?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="enter mx-auto mt-14 w-full max-w-[720px]" style={{ ["--d" as string]: "760ms" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className={`flex items-end gap-3 rounded-3xl bg-card p-3 pl-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] ring-1 transition-shadow duration-200 ${focused ? "ring-white/25" : "ring-white/[0.07]"}`}
      >
        <label htmlFor="hero-ask" className="sr-only">
          Ask anything about building on BOT Chain
        </label>
        <textarea
          id="hero-ask"
          ref={ref}
          rows={1}
          value={value}
          maxLength={1000}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(value);
            }
          }}
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-3 text-[16px] leading-[22px] text-white outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          aria-label="Ask BOTGuide"
          disabled={!value.trim()}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#0a0a0a] transition-opacity duration-150 disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => send(c)}
            className="rounded-full bg-pill/70 px-4 py-2 text-[13px] text-white/80 transition-colors duration-150 hover:bg-pill hover:text-white"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function Word({ w, i, underline }: { w: string; i: number; underline?: boolean }) {
  return (
    <span
      className="enter relative inline-block"
      style={{ ["--d" as string]: `${100 + i * 55}ms`, animationDuration: "650ms" }}
    >
      {w}
      {underline && (
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 right-0 h-[3px] origin-left rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--gold-a), var(--gold-b))",
            animation: "underline-grow 800ms var(--ease-expo) 800ms both",
          }}
        />
      )}
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-32 sm:pt-40 lg:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(180,138,74,0.10), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-[1280px] text-center">
        <a
          href={LINKS.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="enter inline-flex items-center gap-3 rounded-full bg-white/[0.03] py-1.5 pl-1.5 pr-4 text-[13px] ring-1 ring-white/10 transition-colors hover:bg-white/[0.06]"
          style={{ ["--d" as string]: "320ms", animationDuration: "320ms" }}
        >
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[12px] font-medium text-accent">New</span>
          <span>{DOCS_LAST_SYNCED_SHORT ? `Docs synced ${DOCS_LAST_SYNCED_SHORT}` : "Built on the official BOT Chain docs"}</span>
          <External className="text-muted" />
        </a>

        <h1 className="mx-auto mt-9 text-[clamp(2rem,7.4vw,5.5rem)] font-[450] leading-[1.02] tracking-[-0.02em]">
          <span className="block">
            {LINE_1.map((w, i) => (
              <span key={w}>
                <Word w={w} i={i} />{" "}
              </span>
            ))}
          </span>
          <span className="block">
            {LINE_2.map((w, i) => (
              <span key={w}>
                <Word w={w} i={LINE_1.length + i} underline={w === "Chain."} />
                {i < LINE_2.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        </h1>

        <p
          className="enter mx-auto mt-8 max-w-[34rem] text-[18px] leading-7 text-white/80"
          style={{ ["--d" as string]: "580ms", animationDuration: "380ms" }}
        >
          Ask anything. Answers from the official docs, with sources.
        </p>

        <div
          className="enter mt-9 flex flex-wrap justify-center gap-3"
          style={{ ["--d" as string]: "700ms", animationDuration: "380ms" }}
        >
          <Pill href="/ask">
            Ask BOTGuide <Arrow />
          </Pill>
          <Pill href={LINKS.docs} tone="dark">
            Open official docs
          </Pill>
        </div>

        <AskBox />
      </div>
    </section>
  );
}
