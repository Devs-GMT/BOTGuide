import Image from "next/image";
import Link from "next/link";
import {
  LINKS,
  ACTIVE_CONTRACT_ADDRESS,
  ACTIVE_NETWORK,
  explorerContractUrl,
  shortAddress,
} from "@/lib/config";
import { External, Logo, Pill } from "../ui";

type Col = { title: string; links: [string, string][] };

const COLS: Col[] = [
  {
    title: "BOTGuide",
    links: [
      ["Ask BOTGuide", "/ask"],
      ["How it works", "#how"],
      ["Community tips", "#tips"],
    ],
  },
  {
    title: "Network",
    links: [
      ["Mainnet facts", "#network"],
      ["Testnet facts", "#network"],
      ["Add to MetaMask", "#network"],
      ["Live status", "#network"],
    ],
  },
  {
    title: "Developers",
    links: [
      ["Official docs", LINKS.docs],
      ["Deploy guides", "#deploy"],
      ["Snippets", "#developers"],
    ],
  },
  {
    title: "Ecosystem",
    links: [
      ["Explorer", LINKS.explorer],
      ["Faucet", LINKS.faucet],
      ["BDex", LINKS.bdex],
      ["Bo Wallet", LINKS.boWallet],
      ["Bridge", LINKS.bridge],
      ["Staking", LINKS.staking],
    ],
  },
  {
    title: "Support",
    links: [
      ["Ecosystem Support Program", LINKS.support],
      ["FAQ", "#faq"],
      ["Contact (X)", LINKS.x],
    ],
  },
];

function FooterLink({ label, href }: { label: string; href: string }) {
  const cls = "inline-flex items-center gap-1.5 py-1 text-[14px] text-white/60 transition-colors duration-150 hover:text-white";
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
        <External className="opacity-60" />
      </a>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {label}
    </a>
  );
}

export default function Footer() {
  const address = ACTIVE_CONTRACT_ADDRESS;
  return (
    <footer className="hairline-t">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-14 lg:px-6">
        <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-0">
          <div className="flex flex-col gap-8 lg:border-r lg:border-dashed lg:border-line lg:pr-10">
            <div>
              <Logo size={26} />
              <p className="mt-3 text-[13px] text-muted">© 2026 BOTGuide · community project</p>
            </div>
            <div>
              <p className="text-[12px] text-muted">Built on</p>
              <a
                href={LINKS.site}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BOT Chain"
                className="mt-3 inline-block transition-opacity hover:opacity-80"
              >
                <Image src="/brand/botchain-white.svg" alt="BOT Chain" width={1031} height={205} className="h-[26px] w-auto" />
              </a>
            </div>
            <div className="space-y-3">
              <p className="font-mono text-[12.5px] text-muted">
                chain ID {ACTIVE_NETWORK.chainId} · {address ? shortAddress(address) : "contract not deployed yet"}
              </p>
              <Pill href={explorerContractUrl()} external size="sm">
                View on explorer <External />
              </Pill>
            </div>
          </div>

          {/* desktop columns */}
          <div className="hidden grid-cols-5 gap-6 lg:grid lg:pl-10">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="mb-3 text-[14px] font-medium">{c.title}</p>
                <ul>
                  {c.links.map(([l, h]) => (
                    <li key={l}>
                      <FooterLink label={l} href={h} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* mobile accordions */}
          <div className="divide-y divide-line border-y border-line lg:hidden">
            {COLS.map((c) => (
              <details key={c.title} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                  {c.title}
                  <span aria-hidden className="text-muted transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <ul className="pb-3">
                  {c.links.map(([l, h]) => (
                    <li key={l}>
                      <FooterLink label={l} href={h} />
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
        <p className="mt-12 max-w-2xl text-[12.5px] leading-5 text-muted">
          BOTGuide is a community project and is not official BOT Chain documentation. Answers can contain mistakes: check
          important details against the official docs.
        </p>
      </div>
    </footer>
  );
}
