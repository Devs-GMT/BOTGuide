// Answer engine: search the knowledge base in the browser, then stream the answer from /guide.
import { LINKS, MAINNET, TESTNET } from "./config";
import { allowedUrls, parseStream, type GuideChunk } from "./guide";
import { searchKb, toSource, type Source } from "./search";

export type AnswerKind = "answer" | "not-found" | "refusal" | "off-topic";

export type AnswerEvent =
  | { type: "status"; text: string }
  | { type: "meta"; kind: AnswerKind; sources: Source[]; general?: boolean }
  /** The full answer text so far. It replaces what was shown before. */
  | { type: "text"; text: string }
  | { type: "done"; followUps: string[] }
  /** The AI could not be reached: show the matching doc sections instead. */
  | { type: "fallback"; text: string; sources: Source[] };

export type HistoryItem = { role: "user" | "assistant"; content: string };

const REFUSAL = /\b(price|prices|invest|investing|investment|trading|market cap|pump|moon|should i buy|financial advice)\b/i;
const ON_TOPIC =
  /(bot chain|botchain|blockchain|solidity|evm|contract|deploy|wallet|gas|rpc|hardhat|foundry|remix|ethers|web3|metamask|transaction|\btx\b|nonce|testnet|mainnet|faucet|chain id|explorer|verify|\babi\b|erc\d*|smart|token|bridge|staking|validator|dex)/i;
const BOT_SPECIFIC = /\bbot\b|botchain|\btbot\b|bohr|scan\.bot/i;

export const STARTERS: [string, string][] = [
  ["Add BOT Chain to MetaMask", "Network settings in one click"],
  ["Deploy my first contract with Remix", "Compile and deploy in the browser"],
  ["Hardhat config for BOT Chain", "Networks and deploy scripts"],
  ["Get testnet BOT", "Test tokens for gas"],
  ["Verify my contract", "Publish source on the explorer"],
  ["Why is my transaction failing?", "Wrong chain, gas, nonce, reverts"],
];

const DEFAULT_FOLLOW_UPS = ["Add BOT Chain to MetaMask", "Get testnet BOT", "Why is my transaction failing?"];

const NOT_FOUND_TEXT = `I couldn't find this in the BOT Chain docs. I won't guess BOT Chain details such as addresses, chain IDs or RPC URLs. You can check the [official docs](${LINKS.docs}) or add a tip so it can be covered.`;

// Values the answer may repeat even if the retrieved sources do not contain them.
const FIXED_URLS = [
  MAINNET.rpc,
  MAINNET.explorer,
  TESTNET.rpc,
  TESTNET.explorer,
  LINKS.site,
  LINKS.docs,
  LINKS.github,
  LINKS.faucet,
  LINKS.bdex,
  LINKS.boWallet,
  LINKS.bridge,
  LINKS.staking,
];

async function* said(text: string, signal: AbortSignal): AsyncGenerator<AnswerEvent> {
  // static replies still arrive word by word so every answer feels the same
  const tokens = text.split(/(\s+)/);
  let shown = "";
  for (let i = 0; i < tokens.length; i += 4) {
    await new Promise((r) => setTimeout(r, 22));
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    shown += tokens.slice(i, i + 4).join("");
    yield { type: "text", text: shown };
  }
}

function describeFailure(status: number | null) {
  if (status === 429) return "You have asked a lot of questions in the last hour, so I paused the AI for now.";
  if (status === 503) return "The AI is not set up on this server yet.";
  return "I couldn't reach the AI right now.";
}

export async function* streamAnswer(opts: {
  question: string;
  history: HistoryItem[];
  signal: AbortSignal;
}): AsyncGenerator<AnswerEvent> {
  const { question, history, signal } = opts;
  const prev = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  if (REFUSAL.test(question)) {
    yield { type: "meta", kind: "refusal", sources: [] };
    yield* said(
      "I can't help with token prices, trading or investment questions. I can help with building on BOT Chain: networks, wallets, deploying contracts and fixing errors.",
      signal,
    );
    yield { type: "done", followUps: ["Add BOT Chain to MetaMask", "Deploy my first contract with Remix"] };
    return;
  }

  yield { type: "status", text: "Searching the docs…" };

  let chunks: GuideChunk[] = [];
  try {
    chunks = await searchKb(question, prev);
  } catch {
    yield { type: "fallback", text: "I couldn't load the knowledge base. Check your connection and retry.", sources: [] };
    return;
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");

  if (chunks.length === 0) {
    if (!ON_TOPIC.test(question) && !BOT_SPECIFIC.test(question)) {
      yield { type: "meta", kind: "off-topic", sources: [] };
      yield* said("BOTGuide only helps with building on BOT Chain. Ask me about networks, wallets, deploying or debugging.", signal);
      yield { type: "done", followUps: DEFAULT_FOLLOW_UPS };
      return;
    }
    if (BOT_SPECIFIC.test(question)) {
      yield { type: "meta", kind: "not-found", sources: [] };
      yield* said(NOT_FOUND_TEXT, signal);
      yield { type: "done", followUps: DEFAULT_FOLLOW_UPS };
      return;
    }
    // otherwise: a general EVM question, answered without sources and labelled as such
  }

  const sources = chunks.map(toSource);
  yield { type: "status", text: "Writing the answer…" };

  let res: Response;
  try {
    res = await fetch("/guide", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, history: history.slice(-6), chunks }),
      signal,
    });
  } catch (e) {
    if (signal.aborted) throw e;
    yield { type: "fallback", text: `${describeFailure(null)} ${sources.length ? "These doc sections should help:" : ""}`.trim(), sources };
    return;
  }
  if (!res.ok || !res.body) {
    yield { type: "fallback", text: `${describeFailure(res.status)} ${sources.length ? "These doc sections should help:" : ""}`.trim(), sources };
    return;
  }

  const allowed = allowedUrls(chunks, FIXED_URLS);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let raw = "";
  let metaSent = false;
  let lastText = "";

  const handle = (done: boolean) => {
    const p = parseStream(raw, done, allowed);
    return p;
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (value) raw += decoder.decode(value, { stream: true });
      const p = handle(!!done);

      if (!p.pending) {
        if (p.notFound) {
          yield { type: "meta", kind: "not-found", sources: [] };
          yield* said(NOT_FOUND_TEXT, signal);
          yield { type: "done", followUps: DEFAULT_FOLLOW_UPS };
          return;
        }
        if (!metaSent) {
          metaSent = true;
          yield { type: "meta", kind: "answer", sources, general: p.general || sources.length === 0 };
        }
        if (p.text && p.text !== lastText) {
          lastText = p.text;
          yield { type: "text", text: p.text };
        }
      }

      if (done) {
        const final = handle(true);
        if (!metaSent || !final.text) {
          yield { type: "fallback", text: `${describeFailure(null)} ${sources.length ? "These doc sections should help:" : ""}`.trim(), sources };
          return;
        }
        let text = final.text;
        if (final.removedUrls > 0) text += "\n\nSome links were removed because they are not in the BOT Chain docs.";
        if (text !== lastText) yield { type: "text", text };
        yield { type: "done", followUps: final.followUps.length ? final.followUps : DEFAULT_FOLLOW_UPS };
        return;
      }
    }
  } catch (e) {
    if (signal.aborted) throw e;
    if (lastText) {
      yield { type: "done", followUps: DEFAULT_FOLLOW_UPS };
      return;
    }
    yield { type: "fallback", text: describeFailure(null), sources };
  }
}
