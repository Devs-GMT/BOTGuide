import { LINKS } from "@/lib/config";
import Reveal from "../Reveal";
import { Container, External } from "../ui";
import { ArtExplorer, ArtFaucet, ArtSwap, ArtWallet } from "./EcosystemArt";
import TipsStrip from "./TipsStrip";

type Tool = { name: string; href: string; Art: () => React.JSX.Element; note: string; tone: string };

const frame = "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#111] ring-1 ring-white/[0.07] transition-colors duration-300 group-hover:bg-[#151515] group-hover:ring-white/[0.14]";

const TOOLS: Tool[] = [
  { name: "Explorer", href: LINKS.explorer, Art: ArtExplorer, note: "Blocks and transactions", tone: "24 206 190" },
  { name: "Testnet Faucet", href: LINKS.faucet, Art: ArtFaucet, note: "Free tBOT for gas", tone: "74 222 128" },
  { name: "BDex", href: LINKS.bdex, Art: ArtSwap, note: "Swap tokens", tone: "59 110 255" },
  { name: "Bo Wallet", href: LINKS.boWallet, Art: ArtWallet, note: "Hold and send BOT", tone: "255 122 42" },
];

const MORE: { name: string; href: string; note: string; tone: string }[] = [
  { name: "Bridge", href: LINKS.bridge, note: "Connect major L1 ecosystems to BOT Chain", tone: "96 165 250" },
  { name: "Staking", href: LINKS.staking, note: "Stake BOT and earn rewards", tone: "240 205 120" },
  { name: "Ecosystem Support Program", href: LINKS.support, note: "Technical help, resources and growth support for builders", tone: "240 140 170" },
];

export default function Ecosystem() {
  return (
    <>
      <Container id="ecosystem" className="hairline-t">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-[30px] font-medium leading-9 tracking-[-0.01em]">Ecosystem</h2>
          <a href={LINKS.site} target="_blank" rel="noopener noreferrer" className="text-[14px] text-white/80 transition-colors hover:text-white">
            All tools ›
          </a>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t, i) => (
            <Reveal key={t.name} delay={i * 70}>
              <a href={t.href} target="_blank" rel="noopener noreferrer" className="group block">
                <div className={frame} style={{ ["--tone" as string]: t.tone }}>
                  {/* a soft wash of the card's own colour in the corner; it brightens on hover */}
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-[rgb(var(--tone)/0.14)] blur-3xl transition-opacity duration-300 group-hover:bg-[rgb(var(--tone)/0.26)]" />
                  <t.Art />
                </div>
                <p className="mt-4 text-[12.5px] text-muted">Official · {t.note}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[16px] font-medium tracking-[-0.01em]">
                  {t.name}
                  <span className="text-muted transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--tone))]" style={{ ["--tone" as string]: t.tone }}>›</span>
                </p>
              </a>
            </Reveal>
          ))}
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {MORE.map((m) => (
            <li key={m.name} style={{ ["--tone" as string]: m.tone }}>
              <a
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-white/[0.06] transition-[background-color,box-shadow] duration-200 hover:bg-[rgb(var(--tone)/0.08)] hover:ring-[rgb(var(--tone)/0.4)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--tone)/0.14)]">
                  <span className="size-2.5 rounded-full bg-[rgb(var(--tone))]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15.5px] font-medium">{m.name}</span>
                  <span className="mt-0.5 block text-[13.5px] leading-5 text-muted">{m.note}</span>
                </span>
                <External className="shrink-0 text-muted transition-colors duration-200 group-hover:text-[rgb(var(--tone))]" />
              </a>
            </li>
          ))}
        </ul>
      </Container>

      <TipsStrip />
    </>
  );
}
