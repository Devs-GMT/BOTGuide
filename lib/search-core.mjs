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

// The docs are in English. Common Indonesian words are mapped to the docs' words and filler words are dropped,
// so "kenapa transaksi saya gagal" finds the same sections as "why did my transaction fail".
const ID_WORDS = {
  tambah: "add", tambahkan: "add", menambahkan: "add", menambah: "add", jaringan: "network", dompet: "wallet",
  kontrak: "contract", transaksi: "transaction", gagal: "failed error", galat: "error", kesalahan: "error", eror: "error",
  koin: "token", biaya: "fee gas", saldo: "balance", kirim: "send", mengirim: "send", hubungkan: "connect",
  sambungkan: "connect", menghubungkan: "connect", pasang: "install", instal: "install", uji: "test", tes: "test",
  kunci: "key", alamat: "address", blok: "block", waktu: "time", cepat: "fast", verifikasi: "verify",
  dokumentasi: "documentation", macet: "stuck", tersangkut: "stuck", mendapatkan: "get", dapat: "get", klaim: "claim",
  gratis: "free", keamanan: "security", panduan: "guide", contoh: "example", masalah: "problem error",
};
const ID_STOP = new Set(
  "yang di ke dari untuk dengan saya aku gue gua kamu anda bagaimana gimana gmn apa kenapa kok mengapa ini itu dan atau bisa cara caara nih dong sih ga gak nggak tidak udah sudah belum mau ada buat pada dalam kalau jika kalo tolong bantu dulu aja saja lagi juga akan harus pakai menggunakan agar supaya jadi seperti sebuah para oleh".split(" "),
);
const toEnglish = (q) =>
  (q.toLowerCase().match(/[\p{L}\p{N}_.]+|[^\p{L}\p{N}_.]+/gu) || [])
    .map((t) => (ID_STOP.has(t) ? "" : (ID_WORDS[t] ?? t)))
    .join("");

const FOLLOW_UP = /^(and|also|then|ok|okay|what about|how about)\b|\b(it|that|this|those|same)\b/i;

// People say "testnet BOT"; the docs say "tBOT faucet". These add the docs' words to the query.
const EXPANSIONS = [
  [/faucet|test ?net (bot|token)|test (bot|token)|free bot|get (test|bot)/i, "faucet claim tBOT test tokens"],
  [/chain ?id|rpc|explorer|main ?net|test ?net|endpoint|network (setting|detail|value)/i, "Wallet Configuration Chain ID RPC Explorer Native Token"],
  [/block time|finality|how fast|speed/i, "block time 0.75 seconds fast finality"],
  [/fail|error|revert|stuck|pending|nonce|out of gas|not working/i, "common errors fixes wrong network gas nonce reverted"],
  [/metamask|\badd\b.*(bot ?chain|network)|custom network/i, "Add BOT Chain MetaMask custom network one click"],
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
  const base = toEnglish(prev && isFollowUp(question) ? `${question} ${prev}` : question);
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
