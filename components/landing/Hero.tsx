"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DOCS_LAST_SYNCED_SHORT, LINKS } from "@/lib/config";
import { useReducedMotion } from "@/lib/hooks";
import { Arrow, External, Pill } from "../ui";
import BlockPulse from "./BlockPulse";
import HeroStreak from "./HeroStreak";

const LINE_1 = ["Everything", "you", "need"];
const LINE_2 = ["to", "build", "on", "BOT", "Chain."];

const PLACEHOLDERS = [
  "How do I add BOT Chain to MetaMask?",
  "Deploy a contract with Hardhat",
  "What is the RPC URL for testnet?",
  "Why did my transaction revert?",
  "How do I verify a contract?",
];

const icon = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const CHIPS: { label: string; color: string; icon: React.ReactNode }[] = [
  {
    label: "Add BOT Chain to MetaMask",
    color: "#5ec8ff",
    icon: <path d="M8 3v4M16 3v4M6 7h12v4a6 6 0 0 1-12 0V7ZM12 17v4" {...icon} />,
  },
  {
    label: "Deploy with Remix",
    color: "#7ab2ff",
    icon: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" {...icon} />,
  },
  {
    label: "Get testnet BOT",
    color: "#6ee7b7",
    icon: <path d="M12 3s6 6.3 6 10.5a6 6 0 0 1-12 0C6 9.3 12 3 12 3Z" {...icon} />,
  },
];

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
    <div className="enter mx-auto mt-[clamp(1.5rem,6vh,3.75rem)] w-full max-w-[720px]" style={{ ["--d" as string]: "760ms" }}>
      <div className="relative">
        {/* a slow band of cool light runs around the box: faint at rest, bright while typing */}
        {[0, 1].map((k) => (
          <div
            key={k}
            aria-hidden
            className={`pointer-events-none absolute -inset-px rounded-[25px] transition-opacity duration-500 ${k ? "blur-xl" : ""} ${focused ? (k ? "opacity-40" : "opacity-100") : k ? "opacity-0" : "opacity-40"}`}
            style={{
              backgroundImage: "linear-gradient(100deg, #38bdf8, #6ee7b7, #60a5fa, #38bdf8)",
              backgroundSize: "300% 100%",
              animation: "ring-flow 6s linear infinite",
            }}
          />
        ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className="relative flex items-end gap-3 rounded-3xl bg-card p-3 pl-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]"
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
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => send(c.label)}
            className="group flex items-center gap-2 rounded-full bg-pill/70 py-2 pl-3 pr-4 text-[13px] text-white/80 transition-colors duration-150 hover:bg-pill hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden className="transition-transform duration-200 group-hover:scale-110" style={{ color: c.color }}>
              {c.icon}
            </svg>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const ROTATE = ["build", "deploy", "debug", "ship", "verify"];

/** One word of the headline: rises in, then catches a sweep of light. */
function Word({ children, i, shine = true }: { children: React.ReactNode; i: number; shine?: boolean }) {
  const delay = 100 + i * 55;
  return (
    <span
      className={`relative inline-block ${shine ? "word-shine" : ""}`}
      style={{
        animation: `rise 650ms var(--ease-soft) ${delay}ms backwards${shine ? `, shine 5s ease-in-out ${2200 + i * 110}ms infinite` : ""}`,
      }}
    >
      {children}
    </span>
  );
}

/** The verb in the headline: swaps between what developers do on BOT Chain, resizing smoothly so the line never jumps. */
function RotatingVerb() {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [widths, setWidths] = useState<number[]>([]);
  const probes = useRef<(HTMLSpanElement | null)[]>([]);
  const current = useRef(0);

  useEffect(() => {
    const measure = () => setWidths(probes.current.map((el) => el?.getBoundingClientRect().width ?? 0));
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => {
      setPrev(current.current);
      current.current = (current.current + 1) % ROTATE.length;
      setIdx(current.current);
    }, 2600);
    return () => clearInterval(t);
  }, [reduced]);

  const width = widths[idx];
  return (
    <span className="relative inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em] text-[#e2e3e8]" style={{ width: width ? `${width}px` : undefined, transition: "width 450ms var(--ease-expo)" }}>
      {/* the current word stays in the flow so the slot keeps its height */}
      <span key={idx} className="inline-block whitespace-nowrap" style={{ animation: prev === null ? undefined : "verb-in 520ms var(--ease-expo) both" }}>
        {ROTATE[idx]}
      </span>
      {prev !== null && (
        <span key={`p${prev}-${idx}`} aria-hidden className="absolute left-0 top-0 whitespace-nowrap" style={{ animation: "verb-out 420ms var(--ease-soft) both" }}>
          {ROTATE[prev]}
        </span>
      )}
      <span aria-hidden className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap">
        {ROTATE.map((w, k) => (
          <span key={w} ref={(el) => { probes.current[k] = el; }} className="absolute left-0 top-0 whitespace-nowrap">{w}</span>
        ))}
      </span>
    </span>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);

  // As the page scrolls away from the hero, the light drifts down and the text lifts and fades.
  useEffect(() => {
    const el = section.current;
    if (!el || reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight * 0.8)));
      el.style.setProperty("--hs", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section ref={section} className="relative isolate flex min-h-dvh flex-col justify-center overflow-hidden px-4 pb-8 pt-24 lg:px-6">
      <div className="absolute inset-0 -z-10" style={{ transform: "translateY(calc(var(--hs, 0) * 90px))", willChange: "transform" }}>
        <HeroStreak />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.034) 22%, rgba(255,255,255,0.018) 44%, rgba(255,255,255,0.007) 66%, transparent 86%)",
        }}
      />
      <div className="mx-auto w-full max-w-[1280px] text-center" style={{ opacity: "calc(1 - var(--hs, 0) * 0.85)", transform: "translateY(calc(var(--hs, 0) * -36px))" }}>
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

        <h1 className="mx-auto mt-[clamp(1.25rem,4vh,2.5rem)] text-[clamp(2rem,min(7.4vw,10vh),5.5rem)] font-bold leading-[0.98] tracking-[-0.045em]">
          <span className="block">
            {LINE_1.map((w, i) => (
              <span key={w}>
                <Word i={i}>{w}</Word>{" "}
              </span>
            ))}
          </span>
          <span className="block">
            {LINE_2.map((w, i) => (
              <span key={w}>
                {w === "build" ? (
                  <Word i={LINE_1.length + i} shine={false}>
                    <RotatingVerb />
                  </Word>
                ) : (
                  <Word i={LINE_1.length + i}>{w}</Word>
                )}
                {i < LINE_2.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        </h1>

        <p
          className="enter mx-auto mt-[clamp(1rem,3.5vh,2.25rem)] max-w-[34rem] text-[18px] leading-7 text-white/80"
          style={{ ["--d" as string]: "580ms", animationDuration: "380ms" }}
        >
          Ask anything. Answers from the official docs, with sources.
        </p>

        <div
          className="enter mt-[clamp(1rem,4vh,2.5rem)] flex flex-wrap justify-center gap-3"
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
        <BlockPulse />
      </div>
    </section>
  );
}
