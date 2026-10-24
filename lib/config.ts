import kbMeta from "./kb-meta.json";

// Network facts are shown from this fixed config and never generated.
// Verify every value against https://dev-docs.botchain.ai before submitting.

export type Network = {
  key: "mainnet" | "testnet" | "local";
  label: string;
  chainId: number;
  hex: string;
  name: string;
  symbol: string;
  rpc: string;
  explorer: string;
};

export const MAINNET: Network = {
  key: "mainnet",
  label: "Mainnet",
  chainId: 677,
  hex: "0x2a5",
  name: "BOT Chain",
  symbol: "BOT",
  rpc: "https://rpc.botchain.ai",
  explorer: "https://scan.botchain.ai",
};

export const TESTNET: Network = {
  key: "testnet",
  label: "Testnet",
  chainId: 968,
  hex: "0x3c8",
  name: "BOT Chain Testnet",
  symbol: "BOT",
  rpc: "https://rpc.bohr.life",
  explorer: "https://scan.bohr.life",
};

// Set after each deploy. Empty means "not deployed yet".
export const MAINNET_CONTRACT_ADDRESS = "";
export const TESTNET_CONTRACT_ADDRESS = "0x015eDcdd020D0834F69048a467A5b40bf8D16aB9";

// Which network ratings and tips live on. Use "testnet" while testing, "mainnet" for the submission.
export const BOTGUIDE_NETWORK: "mainnet" | "testnet" = "testnet";

// Written by `node build-kb.js`. Re-sync right before submitting.
const SYNCED = (kbMeta as { lastSynced?: string }).lastSynced || null;
export const DOCS_LAST_SYNCED: string | null = SYNCED;
/** "Oct 2026" for the landing badge. */
export const DOCS_LAST_SYNCED_SHORT: string | null = SYNCED
  ? new Date(`${SYNCED}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
  : null;

export const BLOCK_TIME_SECONDS = 0.75; // per botchain.ai

export const LINKS = {
  site: "https://www.botchain.ai/en/",
  docs: "https://dev-docs.botchain.ai/docs/intro",
  explorer: MAINNET.explorer,
  metamask: "https://metamask.io/download/",
  faucet: "https://faucet.botchain.ai/basic",
  bdex: "https://dex.botchain.ai",
  boWallet: "https://wallet.botchain.ai",
  bridge: "https://bridge.botchain.ai",
  staking: "https://staking.botchain.ai",
  telegram: "https://t.me/BOTChainNetwork",
  x: "https://x.com/BOTChain_ai",
  // Application form for the Ecosystem Support Program, linked in the official BOT Chain Telegram channel (post 446).
  support: "https://forms.gle/icspa87HzTJynbYe8",
} as const;

/** The network and contract the app currently talks to (see BOTGUIDE_NETWORK). */
export const ACTIVE_NETWORK = BOTGUIDE_NETWORK === "testnet" ? TESTNET : MAINNET;
export const ACTIVE_CONTRACT_ADDRESS = BOTGUIDE_NETWORK === "testnet" ? TESTNET_CONTRACT_ADDRESS : MAINNET_CONTRACT_ADDRESS;

export function explorerContractUrl() {
  return ACTIVE_CONTRACT_ADDRESS
    ? `${ACTIVE_NETWORK.explorer}/address/${ACTIVE_CONTRACT_ADDRESS}`
    : ACTIVE_NETWORK.explorer;
}

export function shortAddress(a: string) {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export const STARTER_QUESTIONS = [
  "Add BOT Chain to MetaMask",
  "Deploy my first contract with Remix",
  "Hardhat config for BOT Chain",
  "Get testnet BOT",
  "Verify my contract",
  "Why is my transaction failing?",
] as const;
