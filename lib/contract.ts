// Everything the app does with the BOTGuide contract: reading votes and tips, rating, tipping.
import { BrowserProvider, Contract, JsonRpcProvider, id as keccakOfText, type Eip1193Provider } from "ethers";
import {
  BOTGUIDE_NETWORK,
  MAINNET,
  MAINNET_CONTRACT_ADDRESS,
  TESTNET,
  TESTNET_CONTRACT_ADDRESS,
  type Network,
} from "./config";
import { addNetwork } from "./wallet";

// A local node (`npx hardhat node`) for testing without spending BOT:
//   NEXT_PUBLIC_BOTGUIDE_NETWORK=local  NEXT_PUBLIC_BOTGUIDE_ADDRESS=0x...   (in .env.local)
const LOCAL: Network = {
  key: "local",
  label: "Local",
  chainId: 31337,
  hex: "0x7a69",
  name: "Hardhat local",
  symbol: "ETH",
  rpc: "http://127.0.0.1:8545",
  explorer: "http://127.0.0.1:8545",
};
const useLocal = process.env.NEXT_PUBLIC_BOTGUIDE_NETWORK === "local";

export const VOTE_NETWORK: Network = useLocal ? LOCAL : BOTGUIDE_NETWORK === "testnet" ? TESTNET : MAINNET;
export const CONTRACT_ADDRESS: string = useLocal
  ? process.env.NEXT_PUBLIC_BOTGUIDE_ADDRESS || ""
  : BOTGUIDE_NETWORK === "testnet"
    ? TESTNET_CONTRACT_ADDRESS
    : MAINNET_CONTRACT_ADDRESS;
export const contractReady = Boolean(CONTRACT_ADDRESS);

const TIP = "tuple(address author, string title, string body, string section, uint32 upvotes, bool approved, uint64 at)";
const ABI = [
  "function rate(bytes32 answerId, bool helpful)",
  "function getVote(bytes32 answerId, address voter) view returns (uint32 up, uint32 down, uint8 voterChoice)",
  "function submitTip(string title, string body, string section) returns (uint256 id)",
  "function upvoteTip(uint256 id)",
  "function tipUpvoted(uint256 id, address voter) view returns (bool)",
  "function tipCount() view returns (uint256)",
  `function getTips(uint256 from, uint256 count) view returns (${TIP}[] page)`,
  `function getApprovedTips() view returns (uint256[] ids, ${TIP}[] approved)`,
  "function stats() view returns (uint256 tipsSubmitted, uint256 tipsApproved, uint256 helpfulVotes, uint256 notHelpfulVotes)",
  "event TipSubmitted(uint256 indexed id, address indexed author, string title, string section)",
];

export type Tip = {
  id: number;
  author: string;
  title: string;
  body: string;
  section: string;
  upvotes: number;
  approved: boolean;
  at: number;
};

export type VoteState = { up: number; down: number; mine: 0 | 1 | 2 };

/* ---------- answer ids ---------- */

const squash = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** keccak256(normalised question + answer text). Only this hash goes on-chain. */
export function answerIdFor(question: string, answer: string) {
  return keccakOfText(`${squash(question)}\n${squash(answer)}`);
}

/* ---------- reading ---------- */

let readProvider: JsonRpcProvider | null = null;
function reader() {
  if (!contractReady) throw new Error("not_deployed");
  readProvider ??= new JsonRpcProvider(VOTE_NETWORK.rpc, VOTE_NETWORK.chainId, { staticNetwork: true });
  return new Contract(CONTRACT_ADDRESS, ABI, readProvider);
}

const ZERO = "0x0000000000000000000000000000000000000000";

export async function fetchVote(answerId: string, voter?: string | null): Promise<VoteState> {
  const [up, down, mine] = await reader().getVote(answerId, voter || ZERO);
  return { up: Number(up), down: Number(down), mine: Number(mine) as VoteState["mine"] };
}

type RawTip = { author: string; title: string; body: string; section: string; upvotes: bigint; approved: boolean; at: bigint };
const toTip = (id: number, t: RawTip): Tip => ({
  id,
  author: t.author,
  title: t.title,
  body: t.body,
  section: t.section,
  upvotes: Number(t.upvotes),
  approved: t.approved,
  at: Number(t.at),
});

export async function fetchTipCount(): Promise<number> {
  return Number(await reader().tipCount());
}

/** The newest `limit` tips, newest first. */
export async function fetchRecentTips(limit = 30): Promise<Tip[]> {
  const c = reader();
  const total = Number(await c.tipCount());
  const from = Math.max(0, total - limit);
  const page: RawTip[] = await c.getTips(from, limit);
  return page.map((t, i) => toTip(from + i, t)).reverse();
}

export async function fetchTip(id: number): Promise<Tip | null> {
  const c = reader();
  if (id < 0 || id >= Number(await c.tipCount())) return null;
  const [page]: [RawTip[]] = [await c.getTips(id, 1)];
  return page[0] ? toTip(id, page[0]) : null;
}

export async function fetchApprovedTips(): Promise<Tip[]> {
  const [ids, tips]: [bigint[], RawTip[]] = await reader().getApprovedTips();
  return tips.map((t, i) => toTip(Number(ids[i]), t));
}

export async function fetchStats() {
  const [submitted, approved, up, down] = await reader().stats();
  return { tipsSubmitted: Number(submitted), tipsApproved: Number(approved), helpful: Number(up), notHelpful: Number(down) };
}

export async function fetchUpvoted(ids: number[], voter: string): Promise<Set<number>> {
  const c = reader();
  const flags: boolean[] = await Promise.all(ids.map((id) => c.tipUpvoted(id, voter)));
  return new Set(ids.filter((_, i) => flags[i]));
}

/* ---------- writing ---------- */

async function signerContract() {
  if (!contractReady) throw new Error("not_deployed");
  const eth = window.ethereum;
  if (!eth) throw new Error("no_wallet");

  // switch (or add) the network the contract lives on
  const hex = (await eth.request({ method: "eth_chainId" })) as string;
  if (parseInt(hex, 16) !== VOTE_NETWORK.chainId) await addNetwork(VOTE_NETWORK);

  const provider = new BrowserProvider(eth as unknown as Eip1193Provider);
  return new Contract(CONTRACT_ADDRESS, ABI, await provider.getSigner());
}

export type TxStage = "confirm" | "pending";

export async function rateAnswer(answerId: string, helpful: boolean, onStage?: (s: TxStage) => void) {
  const c = await signerContract();
  onStage?.("confirm");
  const tx = await c.rate(answerId, helpful);
  onStage?.("pending");
  await tx.wait();
}

export async function submitTip(
  tip: { title: string; body: string; section: string },
  onStage?: (s: TxStage) => void,
): Promise<number | null> {
  const c = await signerContract();
  onStage?.("confirm");
  const tx = await c.submitTip(tip.title.trim(), tip.body.trim(), tip.section);
  onStage?.("pending");
  const receipt = await tx.wait();
  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = c.interface.parseLog(log);
      if (parsed?.name === "TipSubmitted") return Number(parsed.args[0]);
    } catch {
      /* not our event */
    }
  }
  return null;
}

export async function upvoteTip(id: number, onStage?: (s: TxStage) => void) {
  const c = await signerContract();
  onStage?.("confirm");
  const tx = await c.upvoteTip(id);
  onStage?.("pending");
  await tx.wait();
}

/** Plain-language message for a failed wallet or chain call. */
export function explainError(e: unknown): string {
  const err = e as { code?: string | number; shortMessage?: string; message?: string; reason?: string; revert?: { name?: string } };
  const text = `${err?.shortMessage ?? ""} ${err?.message ?? ""} ${err?.reason ?? ""}`;
  if (err?.message === "not_deployed") return "The BOTGuide contract is not deployed yet.";
  if (err?.message === "no_wallet") return "Install MetaMask to do this.";
  if (err?.code === "ACTION_REJECTED" || err?.code === 4001 || /user rejected|user denied/i.test(text)) return "You cancelled the transaction.";
  if (/AlreadyVoted/.test(text) || err?.revert?.name === "AlreadyVoted") return "You already did this. It only counts once per wallet.";
  if (/OwnTip/.test(text)) return "You can't upvote your own tip.";
  if (/TooLong/.test(text)) return "That text is too long.";
  if (/EmptyField/.test(text)) return "Fill in every field.";
  if (/insufficient funds|INSUFFICIENT_FUNDS/i.test(text)) return "Not enough BOT for gas in this wallet.";
  if (/network|chain/i.test(text) && /switch|mismatch|changed/i.test(text)) return "Switch your wallet to BOT Chain and try again.";
  return "The transaction failed. Check your wallet and try again.";
}
