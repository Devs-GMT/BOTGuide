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
  /(bot chain|botchain|blockchain|solidity|evm|contract|deploy|wallet|gas|rpc|hardhat|foundry|remix|ethers|web3|metamask|transaction|\btx\b|nonce|testnet|mainnet|faucet|chain id|explorer|verify|\babi\b|erc\d*|smart|token|bridge|staking|validator|dex|transaksi|dompet|jaringan|kontrak|gagal|koin|saldo|alamat)/i;
const INDONESIAN =
  /\b(yang|apa|bagaimana|gimana|gmn|siapa|nama|kamu|anda|kenapa|mengapa|saya|aku|gua|gue|cara|caara|tidak|nggak|gak|bisa|dong|nih|sih|untuk|dengan|dari|dan|mau|ada|kok|tolong|bantu|jaringan|dompet|transaksi|gagal|kontrak)\b/i;
const IDENTITY = /\b(your name|who are you|what are you|siapa (kamu|kau|anda)|nama (kamu|kau|mu|anda))\b/i;
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

const DEFAULT_FOLLOW_UPS_ID = ["Cara menambahkan BOT Chain ke MetaMask", "Cara mendapatkan testnet BOT", "Kenapa transaksi saya gagal?"];

const NOT_FOUND_TEXT_ID = `Itu di luar peta saya: saya tidak menemukannya di dokumentasi BOT Chain, dan saya tidak akan menebak detail seperti alamat, chain ID, atau URL RPC. Silakan cek [dokumentasi resmi](${LINKS.docs}) atau tambahkan tip supaya developer berikutnya bisa menemukannya.`;

const NOT_FOUND_TEXT = `That's off my map: I couldn't find this in the BOT Chain docs, and I won't guess details such as addresses, chain IDs or RPC URLs. You can check the [official docs](${LINKS.docs}) or add a tip so the next builder finds it.`;

// Values the answer may repeat even if the retrieved sources do not contain them.
const FIXED_URLS = [
  MAINNET.rpc,
  MAINNET.explorer,
  TESTNET.rpc,
  TESTNET.explorer,
  LINKS.site,
  LINKS.docs,
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
  if (status === 503) return "The AI isn't switched on for this server yet.";
  return "I lost the signal to the AI for a moment.";
}

export async function* streamAnswer(opts: {
  question: string;
  history: HistoryItem[];
  signal: AbortSignal;
}): AsyncGenerator<AnswerEvent> {
  const { question, history, signal } = opts;
  const prev = [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  const id = INDONESIAN.test(question);
  const followUps = id ? DEFAULT_FOLLOW_UPS_ID : DEFAULT_FOLLOW_UPS;
  const notFoundText = id ? NOT_FOUND_TEXT_ID : NOT_FOUND_TEXT;

  if (IDENTITY.test(question)) {
    yield { type: "meta", kind: "off-topic", sources: [] };
    yield* said(
      id
        ? "Saya BOTGuide, pemandu komunitas untuk developer BOT Chain. Saya menjawab dari dokumentasi resmi dan menampilkan sumbernya. Saya bukan dokumentasi resmi BOT Chain."
        : "I'm BOTGuide, a community guide for BOT Chain developers. I answer from the official docs and show my sources. I'm not official BOT Chain documentation.",
      signal,
    );
    yield { type: "done", followUps };
    return;
  }

  if (REFUSAL.test(question)) {
    yield { type: "meta", kind: "refusal", sources: [] };
    yield* said(
      id
        ? "Saya tidak bisa membantu soal harga token, trading, atau investasi. Saya bisa membantu membangun di BOT Chain: jaringan, wallet, deploy kontrak, dan memperbaiki error."
        : "I can't help with token prices, trading or investment questions. I can help with building on BOT Chain: networks, wallets, deploying contracts and fixing errors.",
      signal,
    );
    yield { type: "done", followUps: id ? DEFAULT_FOLLOW_UPS_ID.slice(0, 2) : ["Add BOT Chain to MetaMask", "Deploy my first contract with Remix"] };
    return;
  }

  yield { type: "status", text: "Looking through the docs…" };

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
      yield* said(
        id
          ? "BOTGuide hanya membantu membangun di BOT Chain. Tanyakan soal jaringan, wallet, deploy, atau debugging."
          : "BOTGuide only helps with building on BOT Chain. Ask me about networks, wallets, deploying or debugging.",
        signal,
      );
      yield { type: "done", followUps };
      return;
    }
    if (BOT_SPECIFIC.test(question)) {
      yield { type: "meta", kind: "not-found", sources: [] };
      yield* said(notFoundText, signal);
      yield { type: "done", followUps };
      return;
    }
    // otherwise: a general EVM question, answered without sources and labelled as such
  }

  const sources = chunks.map(toSource);
  yield { type: "status", text: "Found it. Writing the answer…" };

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
          yield* said(notFoundText, signal);
          yield { type: "done", followUps };
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
        yield { type: "done", followUps: final.followUps.length ? final.followUps : followUps };
        return;
      }
    }
  } catch (e) {
    if (signal.aborted) throw e;
    if (lastText) {
      yield { type: "done", followUps };
      return;
    }
    yield { type: "fallback", text: describeFailure(null), sources };
  }
}
