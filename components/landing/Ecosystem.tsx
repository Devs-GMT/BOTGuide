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

const MORE: [string, string][] = [
  ["Bridge", LINKS.bridge],
  ["Staking", LINKS.staking],
  ["Ecosystem Support Program", LINKS.support],
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
        <ul className="mt-10 grid gap-x-6 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {MORE.map(([n, h]) => (
            <li key={n}>
              <a
                href={h}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 py-2.5 text-[14px] text-white/80 transition-colors hover:text-white"
              >
                {n}
                <External className="text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </Container>

      <TipsStrip />
    </>
  );
}
