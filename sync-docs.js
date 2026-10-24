// Copies the English pages of https://dev-docs.botchain.ai into docs/official/*.md.
//
//   node sync-docs.js
//
// Order comes from the "Next" links of the docs, so files follow the sidebar order.
// Be polite: one request per second, and only the docs site is fetched.
// Its robots.txt allows crawling, reserves ai-train=no and use=reference, so the text is used as
// reference material for answers and never for training.

const fs = require("node:fs");
const path = require("node:path");
const cheerio = require("cheerio");
const TurndownService = require("turndown");
const { gfm } = require("turndown-plugin-gfm");

const ORIGIN = "https://dev-docs.botchain.ai";
const OUT = path.join(__dirname, "docs", "official");
const UA = "BOTGuideSync/1.0 (community project; reads the public docs once per sync)";
const DELAY_MS = 1000;
const TODAY = new Date().toISOString().slice(0, 10);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { text: await res.text(), url: res.url };
}

const norm = (u) => u.replace(/[?#].*$/, "").replace(/\/+$/, "");

async function sitemapDocs() {
  const { text } = await get(`${ORIGIN}/sitemap.xml`);
  return [...text.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => norm(m[1]))
    .filter((u) => u.startsWith(`${ORIGIN}/docs`));
}

function turndown() {
  const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
  td.use(gfm);
  td.addRule("image", {
    filter: "img",
    replacement: (_c, node) => {
      const alt = (node.getAttribute("alt") || "").trim();
      return alt ? `[Image: ${alt}]` : "";
    },
  });
  return td;
}

function extract(html, pageUrl) {
  const $ = cheerio.load(html);
  const crumbs = $(".theme-doc-breadcrumbs .breadcrumbs__item")
    .map((_, e) => $(e).text().trim())
    .get()
    .filter(Boolean);
  const article = $(".theme-doc-markdown").first().length ? $(".theme-doc-markdown").first() : $("article").first();
  const title = article.find("h1").first().text().trim() || $("title").text().split("|")[0].trim();

  // next page in the sidebar order
  const next = $("nav.pagination-nav a.pagination-nav__link--next").attr("href");

  article.find("h1").first().remove();
  article
    .find(
      ".theme-doc-toc-mobile, .theme-doc-footer, nav.pagination-nav, .theme-doc-breadcrumbs, .hash-link, .theme-edit-this-page, button, svg, script, style",
    )
    .remove();

  // keep Docusaurus heading ids so citations can link to the exact section
  article.find("h2, h3, h4").each((_, h) => {
    const id = $(h).attr("id");
    $(h).find(".hash-link").remove();
    const text = $(h).text().trim();
    $(h).text(id ? `${text} {#${id}}` : text);
  });

  // code blocks: one clean <pre><code class="language-x">
  article.find('div[class*="language-"], .theme-code-block').each((_, block) => {
    const b = $(block);
    const cls = (b.attr("class") || "").match(/language-([\w-]+)/);
    const pre = b.find("pre").first();
    if (!pre.length) return;
    const lines = pre.find(".token-line");
    const code = lines.length ? lines.map((__, l) => $(l).text().replace(/\n$/, "")).get().join("\n") : pre.text();
    const lang = cls ? cls[1] : "";
    b.replaceWith(`<pre><code class="language-${lang}">${$("<i>").text(code).html()}</code></pre>`);
  });

  // tabs: label each panel
  article.find(".tabs-container").each((_, tabs) => {
    const t = $(tabs);
    const labels = t.find('[role="tab"]').map((__, e) => $(e).text().trim()).get();
    const out = [];
    t.find('[role="tabpanel"]').each((i, panel) => {
      out.push(`<p><strong>${labels[i] || `Option ${i + 1}`}</strong></p>${$(panel).html()}`);
    });
    t.replaceWith(out.join(""));
  });

  // absolute links
  article.find("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    if (href && !/^(https?:|mailto:|#)/.test(href)) $(a).attr("href", new URL(href, pageUrl).href);
  });

  const markdown = turndown()
    .turndown(article.html() || "")
    .replace(/​/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title, crumbs, markdown, next: next ? norm(new URL(next, pageUrl).href) : null };
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  const inSitemap = new Set(await sitemapDocs());
  console.log(`sitemap lists ${inSitemap.size} English docs pages`);

  // 1) walk the "Next" chain from the intro page
  const order = [];
  const seen = new Set();
  const pages = new Map();
  let url = `${ORIGIN}/docs/intro`;
  while (url && !seen.has(url)) {
    seen.add(url);
    await sleep(DELAY_MS);
    const { text, url: finalUrl } = await get(url);
    const page = extract(text, finalUrl);
    pages.set(url, page);
    order.push(url);
    process.stdout.write(`\r${order.length} pages walked`);
    url = page.next;
  }
  console.log();

  // 2) pages in the sitemap but outside the chain (category landing pages and similar)
  const extra = [...inSitemap].filter((u) => !seen.has(u));
  for (const u of extra) {
    await sleep(DELAY_MS);
    try {
      const { text, url: finalUrl } = await get(u);
      pages.set(u, extract(text, finalUrl));
      order.push(u);
    } catch (e) {
      console.warn(`skipped ${u}: ${e.message}`);
    }
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  let kept = 0;
  const skipped = [];
  order.forEach((u) => {
    const p = pages.get(u);
    if (!p || p.markdown.length < 80) {
      skipped.push(`${u} (${p ? p.markdown.length : 0} chars)`);
      return;
    }
    kept++;
    const section = p.crumbs.length > 1 ? p.crumbs[0] : "Overview";
    const file = `${String(kept).padStart(2, "0")}-${slug(u.replace(`${ORIGIN}/docs/`, "")) || "intro"}.md`;
    const front = [
      "---",
      `title: ${JSON.stringify(p.title)}`,
      `section: ${JSON.stringify(section)}`,
      `source_url: ${u}`,
      "source: official",
      `last_synced: ${TODAY}`,
      "---",
      "",
    ].join("\n");
    fs.writeFileSync(path.join(OUT, file), `${front}# ${p.title}\n\n${p.markdown}\n`);
  });

  const missing = [...inSitemap].filter((u) => !pages.has(u));
  console.log(`wrote ${kept} files to docs/official`);
  if (skipped.length) console.log("skipped (too short):\n  " + skipped.join("\n  "));
  if (missing.length) console.log("in sitemap but not fetched:\n  " + missing.join("\n  "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
