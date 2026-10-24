"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { shortAddress } from "@/lib/config";
import { contractReady, fetchApprovedTips, type Tip } from "@/lib/contract";
import Mascot from "../Mascot";
import Reveal from "../Reveal";
import { Arrow, Container, Eyebrow, Pill } from "../ui";

const STEPS = [
  ["Share a tip", "Add what the docs miss: a gotcha, a fix, a shortcut."],
  ["Owner approves", "A tip only counts once the contract owner approves it."],
  ["Answers use it", "Approved tips join the knowledge base and are labeled as community tips."],
];

export default function TipsStrip() {
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    if (!contractReady) return;
    let live = true;
    fetchApprovedTips()
      .then((all) => live && setTips([...all].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <Container id="tips" className="hairline-t">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>Community</Eyebrow>
          <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">Tips from builders</h2>
          <p className="mt-4 max-w-[30rem] text-[18px] leading-7 text-white/90">
            Builders add what the docs leave out. The best tips make the next answer better.
          </p>
          <ol className="mt-8 space-y-5">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/[0.07] font-mono text-[12px] text-white/80">{i + 1}</span>
                <span>
                  <span className="block text-[15px] font-medium">{t}</span>
                  <span className="mt-0.5 block text-[14px] leading-6 text-muted">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Pill href="/ask?tip=all">
              Add a tip <Arrow />
            </Pill>
          </div>
        </div>

        <Reveal>
          {tips.length === 0 ? (
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-3xl bg-card px-6 py-10 text-center ring-1 ring-white/[0.06]">
              <span className="text-white">
                <Mascot mood="hello" size={64} />
              </span>
              <p className="mt-5 text-[16px] font-medium">No approved tips yet</p>
              <p className="mt-1.5 max-w-[22rem] text-[14px] leading-6 text-muted">
                Be the first. Tips show up here after the owner approves them.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tips.map((t, i) => (
                <Reveal as="li" key={t.id} delay={i * 80}>
                  <Link
                    href={`/ask?tip=${t.id}`}
                    className="group block rounded-3xl bg-card p-5 ring-1 ring-white/[0.06] transition-[background-color,box-shadow] duration-200 hover:bg-[#191919] hover:ring-white/[0.14]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[16px] font-medium leading-6">{t.title}</p>
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 font-mono text-[12px] text-white/80">
                        <span aria-hidden>▲</span>
                        {t.upvotes}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-white/70">{t.body}</p>
                    <p className="mt-4 flex items-center gap-2 text-[12.5px] text-muted">
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-white/70">{t.section}</span>
                      <span className="font-mono">{shortAddress(t.author)}</span>
                      <span className="ml-auto text-white/60 transition-transform duration-200 group-hover:translate-x-0.5">Read ›</span>
                    </p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </Container>
  );
}
