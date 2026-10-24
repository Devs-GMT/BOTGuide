// Search over kb.json. Plain JS so a Node script can run the same code as the browser.
import MiniSearch from "minisearch";

/**
 * @typedef {{ id: string, title: string, heading: string, section: string, url: string, source: string, text: string }} Chunk
 * @typedef {{ ms: MiniSearch, byId: Map<string, Chunk> }} Index
 */

// "bot" and "chain" appear on almost every page, so they say nothing about which page to pick.
const STOP = new Set(
  "a an and are as at be by can could do does for from how i if in is it its me my of on or please should so that the this to was we what when where which who why will with would you your about get got use using bot chain botchain".split(" "),
);

const FOLLOW_UP = /^(and|also|then|ok|okay|what about|how about)\b|\b(it|that|this|those|same)\b/i;

// People say "testnet BOT"; the docs say "tBOT faucet". These add the docs' words to the query.
const EXPANSIONS = [
  [/faucet|test ?net (bot|token)|test (bot|token)|free bot|get (test|bot)/i, "faucet claim tBOT test tokens"],
  [/chain ?id|rpc|explorer|main ?net|test ?net|endpoint|network (setting|detail|value)/i, "Wallet Configuration Chain ID RPC Explorer Native Token"],
  [/block time|finality|how fast|speed/i, "block time 0.75 seconds fast finality"],
  [/fail|error|revert|stuck|pending|nonce|out of gas|not working/i, "common errors fixes wrong network gas nonce reverted"],
  [/metamask|add (the )?network|custom network/i, "Add BOT Chain MetaMask custom network one click"],
  [/validator|stake|staking/i, "validator staking guide"],
];

export const MIN_SCORE = 3;
export const RELATIVE_CUTOFF = 0.35;
export const MIN_COVERAGE = 0.5; // share of the question's words that a chunk must contain
export const OFFICIAL_BOOST = 1.15;
export const TIP_COVERAGE = 0.8; // a tip must match this share of the question's words to jump the queue

const tokens = (s) => (s.toLowerCase().match(/[\p{L}\p{N}_.]+/gu) || []).map((t) => t.replace(/^\.+|\.+$/g, ""));

const processTerm = (t) => {
  const w = t.toLowerCase();
  return STOP.has(w) ? null : w;
};

/** @param {Chunk[]} chunks @returns {Index} */
export function buildIndex(chunks) {
  const ms = new MiniSearch({
    fields: ["title", "heading", "text"],
    storeFields: ["id"],
    idField: "id",
    processTerm,
    searchOptions: { boost: { heading: 3, title: 2 }, prefix: true, fuzzy: 0.15, combineWith: "OR", processTerm },
  });
  ms.addAll(chunks);
  return { ms, byId: new Map(chunks.map((c) => [c.id, c])) };
}

/** @param {string} question */
export function isFollowUp(question) {
  return FOLLOW_UP.test(question.trim()) && question.trim().split(/\s+/).length <= 8;
}

/** @param {string} question */
function expand(question) {
  const extra = EXPANSIONS.filter(([re]) => re.test(question)).map(([, add]) => add);
  return [question, ...extra].join(" ");
}

/**
 * @param {Index} index
 * @param {string} question
 * @param {string} [prev] the previous user question
 * @returns {{ hits: { chunk: Chunk, score: number, coverage: number }[], top: number }}
 */
export function search(index, question, prev = "", limit = 5) {
  const base = prev && isFollowUp(question) ? `${question} ${prev}` : question;
  const own = new Set(tokens(base).map((t) => processTerm(t)).filter((t) => t && t.length > 1));
  const results = index.ms.search(expand(base), {
    boostDocument: (id) => (index.byId.get(id)?.source === "official" ? OFFICIAL_BOOST : 1),
  });
  const top = results[0]?.score ?? 0;

  // The relative cutoff is measured against the best chunk that covers the question's words,
  // not against a chunk that only scored high on the added synonyms.
  const covered = results
    .map((r) => {
      // coverage only counts words the person actually typed, not the added synonyms
      const matched = new Set((r.queryTerms || []).filter((t) => own.has(t) || [...own].some((o) => t.startsWith(o) || o.startsWith(t))));
      return { r, coverage: own.size ? matched.size / own.size : 0 };
    })
    .filter(({ r, coverage }) => r.score >= MIN_SCORE && coverage >= MIN_COVERAGE);
  const best = covered[0]?.r.score ?? 0;
  const ranked = covered.filter(({ r }) => r.score >= best * RELATIVE_CUTOFF);
  const picked = ranked.slice(0, limit);
  // Tips are short, so their raw score is low next to long doc pages. A tip that matches nearly every
  // word of the question still gets a slot (it replaces the weakest pick).
  const tip = ranked.slice(limit).find(({ r, coverage }) => index.byId.get(r.id)?.source === "community-tip" && coverage >= TIP_COVERAGE);
  if (tip && !picked.some(({ r }) => index.byId.get(r.id)?.source === "community-tip")) {
    if (picked.length >= limit) picked.pop();
    picked.push(tip);
  }
  const hits = picked
    .map(({ r, coverage }) => ({ chunk: index.byId.get(r.id), score: r.score, coverage }))
    .filter((h) => h.chunk);
  return { hits, top };
}
