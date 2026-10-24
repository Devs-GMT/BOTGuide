// Quick quality check: runs the PRD's test questions through the same search the app uses.
//   node scripts/check-kb.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildIndex, search } from "../lib/search-core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const kb = JSON.parse(fs.readFileSync(path.join(here, "..", "public", "kb.json"), "utf8"));
const index = buildIndex(kb.chunks);

const questions = [
  ["Add BOT Chain to MetaMask", ""],
  ["What are the chain IDs for testnet and mainnet?", ""],
  ["What is the RPC URL for BOT Chain mainnet?", ""],
  ["How do I get testnet BOT?", ""],
  ["Deploy my first contract with Remix", ""],
  ["Hardhat config for BOT Chain", ""],
  ["How do I deploy with Foundry?", ""],
  ["Connect with ethers.js", ""],
  ["Verify my contract", ""],
  ["Why is my transaction failing?", ""],
  ["What is the block time?", ""],
  ["How do I become a validator?", ""],
  ["And on testnet?", "Add BOT Chain to MetaMask"],
  ["What is the best pizza topping?", ""],
];

for (const [q, prev] of questions) {
  const { hits, top } = search(index, q, prev);
  console.log(`\n? ${q}${prev ? `   (after: ${prev})` : ""}   top=${top.toFixed(1)}  hits=${hits.length}`);
  for (const h of hits.slice(0, 3)) {
    console.log(`   ${h.score.toFixed(1).padStart(5)}  ${h.chunk.source === "official" ? "O" : "C"}  ${h.chunk.title} > ${h.chunk.heading || "-"}`);
  }
}
