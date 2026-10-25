import { LINKS } from "@/lib/config";
import Reveal from "../Reveal";
import { Container, SectionHead } from "../ui";
import { ArtAll, ArtBridge, ArtExplorer, ArtFaucet, ArtStaking, ArtSupport, ArtSwap, ArtWallet } from "./EcosystemArt";
import TipsStrip from "./TipsStrip";

type Tool = { name: string; href: string; Art: () => React.JSX.Element; note: string; tone: string; tag?: string };

const frame = "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#111] ring-1 ring-white/[0.07] transition-[background-color,box-shadow,transform] duration-300 ease-out group-hover:-translate-y-1 group-hover:bg-[#151515] group-hover:ring-white/[0.14] group-hover:shadow-[0_24px_50px_-28px_rgb(var(--tone)/0.5)]";

const TOOLS: Tool[] = [
  { name: "Explorer", href: LINKS.explorer, Art: ArtExplorer, note: "Blocks and transactions", tone: "24 206 190" },
  { name: "Testnet Faucet", href: LINKS.faucet, Art: ArtFaucet, note: "Free tBOT for gas", tone: "74 222 128" },
  { name: "BDex", href: LINKS.bdex, Art: ArtSwap, note: "Swap tokens", tone: "59 110 255" },
  { name: "Bo Wallet", href: LINKS.boWallet, Art: ArtWallet, note: "Hold and send BOT", tone: "255 122 42" },
  { name: "Bridge", href: LINKS.bridge, Art: ArtBridge, note: "Move assets between chains", tone: "96 165 250" },
  { name: "Staking", href: LINKS.staking, Art: ArtStaking, note: "Stake BOT, earn rewards", tone: "240 205 120" },
  { name: "Ecosystem Support Program", href: LINKS.support, Art: ArtSupport, note: "Help and resources for builders", tone: "240 140 170" },
  { name: "All tools", href: LINKS.site, Art: ArtAll, note: "Everything on botchain.ai", tone: "255 255 255", tag: "More" },
];

export default function Ecosystem() {
  return (
    <>
      <Container id="ecosystem" className="hairline-t">
        <SectionHead eyebrow="Ecosystem" title="Tools around the chain" />
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t, i) => (
            <Reveal key={t.name} delay={i * 70}>
              <a href={t.href} target="_blank" rel="noopener noreferrer" className="group block">
                <div className={frame} style={{ ["--tone" as string]: t.tone }}>
                  {/* a soft wash of the card's own colour in the corner; it brightens on hover */}
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-[rgb(var(--tone)/0.14)] blur-3xl transition-opacity duration-300 group-hover:bg-[rgb(var(--tone)/0.26)]" />
                  <t.Art />
                </div>
                <p className="mt-4 text-[12.5px] text-muted">{t.tag ?? "Official"} · {t.note}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[16px] font-medium tracking-[-0.01em]">
                  {t.name}
                  <span className="text-muted transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--tone))]" style={{ ["--tone" as string]: t.tone }}>›</span>
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>

      <TipsStrip />
    </>
  );
}
