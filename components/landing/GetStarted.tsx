import { LINKS } from "@/lib/config";
import Reveal from "../Reveal";
import { Check, Container, External, Pill } from "../ui";

function Card({
  title,
  lead,
  items,
  cta,
}: {
  title: string;
  lead: string;
  items: string[];
  cta: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-card p-7 sm:p-9">
      <h3 className="text-[24px] font-medium leading-8 tracking-[-0.01em]">{title}</h3>
      <p className="mt-2 text-[15px] leading-6 text-white/80">{lead}</p>
      <ul className="mt-7 flex-1 space-y-3.5 border-t border-line pt-7">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-3 text-[14.5px] leading-6 text-white/85">
            <Check className="mt-1 shrink-0 text-muted" />
            {i}
          </li>
        ))}
      </ul>
      <div className="mt-9">{cta}</div>
    </div>
  );
}

export default function GetStarted() {
  return (
    <Container className="hairline-t">
      <h2 className="text-center text-[clamp(1.8rem,3.5vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
        Choose how to get started
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Reveal>
          <Card
            title="Build on your own"
            lead="Start shipping on BOT Chain with:"
            items={[
              "Answers from the official docs",
              "Copy-ready snippets",
              "One-click network setup",
              "Testnet faucet",
            ]}
            cta={
              <Pill href="/ask" full>
                Ask BOTGuide
              </Pill>
            }
          />
        </Reveal>
        <Reveal delay={90}>
          <Card
            title="Get extra support"
            lead="Talk to the BOT Chain community and team."
            items={[
              "Official community channels",
              "Ecosystem Support Program",
              "Community tips",
              "Hackathon guidebook",
            ]}
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
