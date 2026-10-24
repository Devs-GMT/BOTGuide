"use client";

import { useInView } from "@/lib/hooks";
import Mascot, { type Mood } from "../Mascot";
import Reveal from "../Reveal";
import { Arrow, Container, Eyebrow, Pill } from "../ui";

const CHUNKS: [string, number][] = [
  ["Hardhat · Deploy", 0.92],
  ["Network · RPC URLs", 0.64],
  ["Lessons · Common errors", 0.31],
];

function IllustrationAsk() {
  return (
    <div className="rounded-xl bg-[#101010] p-4 font-mono text-[12.5px] leading-6 ring-1 ring-white/[0.06]">
      <p className="text-muted">you</p>
      <p className="caret">how do I deploy with hardhat?</p>
    </div>
  );
}

function IllustrationRead() {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="space-y-3 rounded-xl bg-[#101010] p-4 font-mono text-[12px] ring-1 ring-white/[0.06]">
      {CHUNKS.map(([name, score], i) => (
        <div key={name}>
          <div className="mb-1.5 flex justify-between text-white/80">
            <span>{name}</span>
            <span className="text-muted">example</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-[900ms] ease-[var(--ease-expo)]"
              style={{ width: seen ? `${score * 100}%` : "0%", transitionDelay: `${i * 140}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function IllustrationAnswer() {
  return (
    <div className="rounded-xl bg-[#101010] p-4 font-mono text-[12.5px] leading-6 ring-1 ring-white/[0.06]">
      <p>
        1. Add the network <span className="rounded bg-accent/15 px-1 text-[10.5px] text-accent">[1]</span>
      </p>
      <p>
        2. Set the RPC URL <span className="rounded bg-accent/15 px-1 text-[10.5px] text-accent">[1]</span>
      </p>
      <p>
        3. Deploy <span className="rounded bg-accent/15 px-1 text-[10.5px] text-accent">[2]</span>
      </p>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    mood: "hello" as Mood,
    title: "Ask",
    line: "Type any question about building on BOT Chain, in plain English.",
    art: <IllustrationAsk />,
  },
  {
    n: "02",
    mood: "thinking" as Mood,
    title: "BOTGuide reads the docs",
    line: "It searches the official developer docs and community notes for the right sections.",
    art: <IllustrationRead />,
  },
  {
    n: "03",
    mood: "done" as Mood,
    title: "Get an answer you can check",
    line: "Steps, code and [1] [2] links to the exact doc page. Rate it on BOT Chain to make it better.",
    art: <IllustrationAnswer />,
  },
];

export default function HowItWorks() {
  return (
    <Container id="how" className="hairline-t">
      <Reveal>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="max-w-[18ch] text-[clamp(2rem,4.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em]">
          From question to deployed, in three steps.
        </h2>
      </Reveal>
      <div className="mt-14 grid md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal
            key={s.n}
            delay={i * 90}
            className={`flex flex-col py-8 md:px-8 md:py-2 ${i > 0 ? "border-t border-line md:border-l md:border-t-0" : "md:pl-0"} ${i === 2 ? "md:pr-0" : ""}`}
          >
            <div className="flex items-center gap-3">
              <Mascot mood={s.mood} size={56} className="text-white" />
              <span className="font-mono text-[13px] text-accent">{s.n}</span>
              {i < STEPS.length - 1 && <span aria-hidden className="hidden h-px flex-1 border-t border-dashed border-accent/40 md:block" />}
            </div>
            <h3 className="mt-6 text-[22px] font-medium leading-7 tracking-[-0.01em]">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-6 text-muted">{s.line}</p>
            <div className="mt-8">{s.art}</div>
          </Reveal>
        ))}
      </div>
      <div className="mt-12">
        <Pill href="/ask">
          Try it now <Arrow />
        </Pill>
      </div>
    </Container>
  );
}
