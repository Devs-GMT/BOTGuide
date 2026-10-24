import { LINKS } from "@/lib/config";
import Reveal from "../Reveal";
import { Container, External } from "../ui";
import TipsStrip from "./TipsStrip";

type Tool = { name: string; href: string; art: string };

const grain = "grain relative aspect-[4/3] w-full overflow-hidden rounded-2xl";

const TOOLS: Tool[] = [
  {
    name: "Explorer",
    href: LINKS.explorer,
    art: "radial-gradient(70% 90% at 20% 110%, #b48a4a 0%, transparent 60%), radial-gradient(60% 80% at 90% 0%, #3a2f1f 0%, transparent 70%), #12100d",
  },
  {
    name: "Testnet Faucet",
    href: LINKS.faucet,
    art: "radial-gradient(80% 80% at 80% 100%, #8a8a8a 0%, transparent 55%), radial-gradient(60% 70% at 10% 0%, #2a2a2a 0%, transparent 70%), #101010",
  },
  {
    name: "BDex",
    href: LINKS.bdex,
    art: "radial-gradient(70% 70% at 0% 50%, #f26b3a 0%, transparent 55%), radial-gradient(60% 80% at 100% 100%, #3b2418 0%, transparent 70%), #110d0b",
  },
  {
    name: "Bo Wallet",
    href: LINKS.boWallet,
    art: "radial-gradient(90% 60% at 50% 120%, #6e5a3a 0%, transparent 65%), radial-gradient(50% 60% at 80% 10%, #4a4a4a 0%, transparent 70%), #0f0f0f",
  },
];

const MORE: [string, string][] = [
  ["Bridge", LINKS.bridge],
  ["Staking", LINKS.staking],
  ["GitHub", LINKS.github],
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
                <div className={grain}>
                  <div
                    className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    style={{ background: t.art }}
                  />
                </div>
                <p className="mt-4 text-[12.5px] text-muted">Tool · Official</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[16px] font-medium tracking-[-0.01em]">
                  {t.name}
                  <span className="text-muted transition-transform duration-200 group-hover:translate-x-0.5">›</span>
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
