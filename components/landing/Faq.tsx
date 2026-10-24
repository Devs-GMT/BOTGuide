"use client";

import { useState } from "react";
import { Container } from "../ui";

const FAQ: [string, string][] = [
  [
    "Is this official?",
    "No. BOTGuide is a community project. It links to the official BOT Chain developer docs and is not official BOT Chain documentation. If anything here disagrees with the official docs, the official docs win.",
  ],
  [
    "Where do answers come from?",
    "From a knowledge base built from the official developer docs, the BOT Chain site, the hackathon guidebook and notes from real builds. Each answer cites the sections it used, and says so when the docs don't cover the question.",
  ],
  [
    "Is my chat saved?",
    "Only in your browser. There is no server-side history and nothing about your conversation goes on-chain.",
  ],
  [
    "What goes on BOT Chain?",
    "Your votes on answers and the community tips you submit. No tokens and no payments.",
  ],
  [
    "Do I need a wallet?",
    "Only to vote on an answer or add a tip. Asking questions works without one.",
  ],
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Container id="faq" className="hairline-t">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <h2 className="text-[30px] font-medium leading-9 tracking-[-0.01em]">FAQ</h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-medium tracking-[-0.01em]"
                  >
                    {q}
                    <span
                      aria-hidden
                      className={`grid size-7 shrink-0 place-items-center rounded-full bg-pill text-[16px] leading-none transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  role="region"
                  className={`grid transition-[grid-template-rows] duration-300 ease-[var(--ease-panel)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[40rem] pb-6 text-[15px] leading-7 text-white/75">{a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
