// Checks that an approved tip is found by questions phrased differently from the tip.
//   node scripts/tip-check.mjs
import fs from "node:fs";
import { buildIndex, search } from "../lib/search-core.mjs";

const kb = JSON.parse(fs.readFileSync(new URL("../public/kb.json", import.meta.url), "utf8"));
const tip = {
  id: "tip-0",
  title: "Claim tBOT before deploying",
  heading: "",
  section: "Other",
  source: "community-tip",
  url: "/ask?tip=0",
  text: "Claim tBOT from the faucet first. Deploys on testnet fail without gas, and the faucet allows 10 tBOT per address per 24 hours.",
};
const index = buildIndex([...kb.chunks, tip]);
for (const q of ["Why do my testnet deploys fail without gas?", "Should I claim tBOT before deploying?", "my deploy fails on testnet, no gas"]) {
  const { hits, top } = search(index, q);
  console.log(`\n? ${q}  top=${top.toFixed(1)}`);
  for (const h of hits) console.log(`  ${h.score.toFixed(1)} cov=${h.coverage.toFixed(2)} ${h.chunk.id === "tip-0" ? "TIP" : "doc"} ${h.chunk.title}`);
}
