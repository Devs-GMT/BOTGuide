// Turns every Markdown file under docs/ into public/kb.json, the file the app searches.
//
//   node build-kb.js
//
// Each page is cut at "##" / "###" headings into chunks of roughly 300-500 words.
// Code blocks are never split. Chunks keep a link to the exact heading when the page has one.

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "docs");
const OUT = path.join(__dirname, "public", "kb.json");
const DIRS = ["official", "site", "guidebook", "lessons"];
const MAX_WORDS = 500;
const MIN_WORDS = 90;
const MIN_CHUNK_WORDS = 12; // landing pages that only list links carry nothing to answer from

function readFrontMatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = JSON.parse(v);
    meta[line.slice(0, i).trim()] = v;
  }
  return { meta, body: raw.slice(m[0].length) };
}

const words = (s) => (s.match(/\S+/g) || []).length;

/** Splits a page body into sections at ##/###/#### headings, ignoring "#" lines inside code blocks. */
function sections(body) {
  const out = [{ heading: "", anchor: "", lines: [] }];
  let inCode = false;
  for (const line of body.split("\n")) {
    if (/^```/.test(line)) inCode = !inCode;
    const h = !inCode && line.match(/^(#{2,4})\s+(.*?)(?:\s*\{#([^}]+)\})?\s*$/);
    if (h) out.push({ heading: h[2].trim(), anchor: h[3] || "", lines: [] });
    else out[out.length - 1].lines.push(line);
  }
  return out;
}

/** Cuts a long section into pieces under MAX_WORDS at paragraph boundaries, never inside code. */
function splitLong(text) {
  const blocks = [];
  let cur = [];
  let inCode = false;
  for (const line of text.split("\n")) {
    if (/^```/.test(line)) inCode = !inCode;
    cur.push(line);
    if (!inCode && line.trim() === "") {
      blocks.push(cur.join("\n"));
      cur = [];
    }
  }
  if (cur.length) blocks.push(cur.join("\n"));

  const parts = [];
  let part = "";
  for (const b of blocks) {
    if (part && words(part) + words(b) > MAX_WORDS) {
      parts.push(part.trim());
      part = "";
    }
    part += `${b}\n`;
  }
  if (part.trim()) parts.push(part.trim());
  return parts;
}

function clean(text) {
  return text
    .replace(/^(\s*)-\s{2,}/gm, "$1- ")
    .replace(/^(\s*)(\d+)\.\s{2,}/gm, "$1$2. ")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunksFor(file, meta, body) {
  const base = path.basename(file, ".md");
  const secs = sections(body.replace(/^# .*\n/, "")).map((s) => ({ ...s, text: clean(s.lines.join("\n")) }));

  // merge sections that are too small into the next one so chunks stay useful
  const merged = [];
  for (let i = 0; i < secs.length; i++) {
    let s = { ...secs[i] };
    while (words(s.text) < MIN_WORDS && i + 1 < secs.length) {
      const next = secs[i + 1];
      s = {
        heading: s.heading || next.heading,
        anchor: s.anchor || next.anchor,
        text: clean(`${s.text}\n\n${next.heading ? `**${next.heading}**\n\n` : ""}${next.text}`),
      };
      i++;
    }
    if (words(s.text) >= MIN_CHUNK_WORDS) merged.push(s);
  }

  const out = [];
  let n = 0;
  for (const s of merged) {
    const pieces = words(s.text) > MAX_WORDS ? splitLong(s.text) : [s.text];
    pieces.forEach((text, k) => {
      const url = meta.source_url ? `${meta.source_url}${s.anchor && k === 0 ? `#${s.anchor}` : ""}` : "";
      out.push({
        id: `${base}:${n++}`,
        title: meta.title || base,
        heading: s.heading,
        section: meta.section || "",
        url,
        source: meta.source || "official",
        text,
      });
    });
  }
  return out;
}

function main() {
  const chunks = [];
  const pages = [];
  let lastSynced = "";
  for (const dir of DIRS) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) continue;
    for (const f of fs.readdirSync(full).filter((x) => x.endsWith(".md")).sort()) {
      const { meta, body } = readFrontMatter(fs.readFileSync(path.join(full, f), "utf8"));
      const c = chunksFor(f, meta, body);
      chunks.push(...c);
      pages.push(`${dir}/${f}`);
      if ((meta.last_synced || "") > lastSynced) lastSynced = meta.last_synced;
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ builtAt: new Date().toISOString(), lastSynced, chunks }));
  // small file the app imports at build time (landing badge, sidebar)
  fs.writeFileSync(
    path.join(__dirname, "lib", "kb-meta.json"),
    `${JSON.stringify({ lastSynced, pages: pages.length, chunks: chunks.length }, null, 2)}\n`,
  );

  const w = chunks.map((c) => words(c.text));
  const bySource = chunks.reduce((m, c) => ((m[c.source] = (m[c.source] || 0) + 1), m), {});
  console.log(`${pages.length} pages -> ${chunks.length} chunks`);
  console.log("by source:", bySource);
  console.log(`words per chunk: min ${Math.min(...w)}, avg ${Math.round(w.reduce((a, b) => a + b, 0) / w.length)}, max ${Math.max(...w)}`);
  console.log(`kb.json: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB, last synced ${lastSynced}`);
}

main();
