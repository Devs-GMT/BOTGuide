import type { Source } from "@/lib/search";

/** A small route map: question -> the doc sections used -> answer. Filled dots are official docs, rings are community. */
export default function SourceTrail({ items }: { items: { s: Source; n: number }[] }) {
  const seg = (i: number) => (
    <span aria-hidden className="relative mx-1 h-px w-7 shrink-0 sm:w-10">
      <span
        className="absolute inset-0 origin-left border-t border-dashed border-accent/60"
        style={{ animation: "trail-draw 500ms var(--ease-expo) both", animationDelay: `${i * 140}ms` }}
      />
    </span>
  );
  return (
    <div className="mb-3 flex flex-wrap items-center gap-y-2 text-[12.5px] text-muted">
      <ol className="flex items-center" aria-label="Where this answer comes from">
        <li className="flex items-center">
          <span className="grid size-[18px] place-items-center rounded-full border border-white/30 text-[10px] text-white/70" title="Your question">?</span>
          {seg(0)}
        </li>
        {items.map(({ s, n }, i) => (
          <li key={s.id} className="flex items-center">
            <span
              title={`${s.title} · ${s.section}`}
              className={`grid size-[18px] place-items-center rounded-full font-mono text-[10px] ${s.kind === "official" ? "bg-accent text-[#0a0a0a]" : "border border-accent text-accent"}`}
            >
              {n}
            </span>
            {seg(i + 1)}
          </li>
        ))}
        <li>
          <span className="block size-[18px] rounded-full bg-white shadow-[0_0_10px_rgba(47,219,166,0.55)]" title="Answer" />
        </li>
      </ol>
      <span className="ml-3">
        {items.length} {items.length === 1 ? "section" : "sections"} from the docs
      </span>
    </div>
  );
}
