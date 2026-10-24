"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { contractReady, fetchApprovedTips, type Tip } from "@/lib/contract";

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
    <section id="tips" className="hairline-t">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="min-w-0 text-[14px] text-muted">
          <span className="mr-3 text-white">Community tips</span>
          {tips.length === 0 ? (
            "No approved tips yet. Tips appear here after the owner approves them."
          ) : (
            <ul className="mt-2 space-y-1.5">
              {tips.map((t) => (
                <li key={t.id}>
                  <Link href={`/ask?tip=${t.id}`} className="text-white/85 hover:text-white">
                    {t.title}
                  </Link>{" "}
                  <span className="text-muted">· {t.section} · ▲ {t.upvotes}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link href="/ask" className="shrink-0 text-[14px] text-white/80 transition-colors hover:text-white">
          Add a tip ›
        </Link>
      </div>
    </section>
  );
}
