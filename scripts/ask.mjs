// Asks the running dev server a question end to end: search kb.json, then POST /guide.
//   node scripts/ask.mjs "How do I get testnet BOT?" [previous question]
// Needs `npm run dev` to be running on http://localhost:3000.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, search } from "../lib/search-core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const kb = JSON.parse(fs.readFileSync(path.join(here, "..", "public", "kb.json"), "utf8"));
const index = buildIndex(kb.chunks);

const [question, prev = ""] = process.argv.slice(2);
if (!question) {
  console.error('usage: node scripts/ask.mjs "question" ["previous question"]');
  process.exit(1);
}

const { hits } = search(index, question, prev);
console.log(`sources: ${hits.map((h, i) => `[${i + 1}] ${h.chunk.title} > ${h.chunk.heading || "-"}`).join(" | ") || "none"}\n`);

const base = process.env.BASE || "http://localhost:3000";
const res = await fetch(`${base}/guide`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    question,
    history: prev ? [{ role: "user", content: prev }] : [],
    chunks: hits.map((h) => h.chunk),
  }),
});

console.log(`HTTP ${res.status}\n`);
const reader = res.body.getReader();
const dec = new TextDecoder();
const t0 = Date.now();
let first = 0;
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  if (!first) first = Date.now() - t0;
  process.stdout.write(dec.decode(value, { stream: true }));
}
console.log(`\n\n(first token ${first} ms, total ${Date.now() - t0} ms)`);
