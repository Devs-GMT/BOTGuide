import { LINKS } from "@/lib/config";
import Mascot from "../Mascot";
import Reveal from "../Reveal";
import { Check, Container, External, Pill, SectionHead } from "../ui";

function ArtBuild() {
  return (
    <div className="absolute inset-0 flex items-center gap-4 px-6">
      <span className="shrink-0 text-white transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-105">
        <Mascot mood="done" size={64} />
      </span>
      <div className="min-w-0 flex-1 space-y-2 text-[12.5px] leading-5">
        <p className="ml-auto w-fit max-w-full rounded-2xl rounded-br-md bg-white/[0.11] px-3.5 py-2 text-white/90">How do I deploy with Hardhat?</p>
        <p className="w-fit max-w-full rounded-2xl rounded-bl-md bg-white/[0.05] px-3.5 py-2 text-white/75">
          Add botMainnet to your config
          <span className="mx-0.5 ml-1.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded bg-accent/15 px-1 font-mono text-[10.5px] text-accent">1</span>
          <span className="mx-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded bg-accent/15 px-1 font-mono text-[10.5px] text-accent">2</span>
        </p>
      </div>
    </div>
  );
}

const CHANNELS = ["Telegram", "X, @BOTChain_ai", "Support program"];

function ArtSupport() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5">
      <span className="text-white transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-3">
        <Mascot mood="hello" size={60} />
      </span>
      <div className="flex flex-wrap justify-center gap-2">
        {CHANNELS.map((c, i) => (
          <span
            key={c}
            className="rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[12.5px] text-white/80 ring-1 ring-white/[0.08] transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
            style={{ transitionDelay: `${i * 45}ms` }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Card({
  art,
  title,
  lead,
  items,
  cta,
}: {
  art: React.ReactNode;
  title: string;
  lead: string;
  items: string[];
  cta: React.ReactNode;
}) {
  return (
    <div className="group flex h-full flex-col rounded-3xl bg-card p-4 ring-1 ring-white/[0.06] transition-[box-shadow,background-color] duration-300 hover:bg-[#191919] hover:ring-white/[0.12] sm:p-5">
      <div className="relative h-[176px] overflow-hidden rounded-2xl bg-[#101010] ring-1 ring-white/[0.05]">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        {art}
      </div>
      <div className="px-3 pb-3 pt-6 sm:px-4">
        <h3 className="text-[24px] font-medium leading-8 tracking-[-0.01em]">{title}</h3>
        <p className="mt-1.5 text-[15px] leading-6 text-white/70">{lead}</p>
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {items.map((i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.035] px-3.5 py-3 text-[14px] leading-5 text-white/85 ring-1 ring-white/[0.05] transition-colors duration-200 hover:bg-white/[0.07]">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/80">
                <Check />
              </span>
              {i}
            </li>
          ))}
        </ul>
        <div className="mt-7">{cta}</div>
      </div>
    </div>
  );
}

export default function GetStarted() {
  return (
    <Container className="hairline-t">
      <SectionHead eyebrow="Get started" title="Choose how to get started" />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Reveal>
          <Card
            art={<ArtBuild />}
            title="Build on your own"
            lead="Start shipping on BOT Chain with:"
            items={["Answers from the official docs", "Copy-ready snippets", "One-click network setup", "Testnet faucet"]}
            cta={
              <Pill href="/ask" full>
                Ask BOTGuide
              </Pill>
            }
          />
        </Reveal>
        <Reveal delay={90}>
          <Card
            art={<ArtSupport />}
            title="Get extra support"
            lead="Talk to the BOT Chain community and team."
            items={["BOT Chain community channels", "Ecosystem Support Program", "Community tips", "Official docs"]}
            cta={
              <Pill href={LINKS.support} tone="outline" full external>
                Get support <External />
              </Pill>
            }
          />
        </Reveal>
      </div>
    </Container>
  );
}
