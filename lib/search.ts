import { buildIndex, search } from "./search-core.mjs";
import type { GuideChunk } from "./guide";
import { contractReady, fetchApprovedTips } from "./contract";

export type Source = {
  id: string;
  title: string;
  section: string;
  /** empty for community notes that have no page of their own */
  url: string;
  kind: "official" | "community" | "tip";
};

type Loaded = ReturnType<typeof buildIndex>;

let loading: Promise<Loaded> | null = null;

/** Owner-approved tips from the chain, as extra chunks. Unapproved tips never reach this list. Fails quietly. */
async function approvedTipChunks(): Promise<GuideChunk[]> {
  if (!contractReady) return [];
  try {
    const tips = await Promise.race([
      fetchApprovedTips(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000)),
    ]);
    return tips
      .filter((t) => t.approved)
      .map((t) => ({
        id: `tip-${t.id}`,
        title: t.title,
        heading: "",
        section: t.section,
        source: "community-tip",
        url: `/ask?tip=${t.id}`,
        text: t.body,
      }));
  } catch {
    return [];
  }
}

/** Downloads kb.json once and builds the search index in the browser. */
export function loadKb(): Promise<Loaded> {
  if (!loading) {
    loading = fetch("/kb.json")
      .then((r) => {
        if (!r.ok) throw new Error(`kb.json ${r.status}`);
        return r.json() as Promise<{ chunks: GuideChunk[] }>;
      })
      .then(async (kb) => buildIndex([...kb.chunks, ...(await approvedTipChunks())]))
      .catch((e) => {
        loading = null; // try again next time
        throw e;
      });
  }
  return loading;
}

export async function searchKb(question: string, prev: string): Promise<GuideChunk[]> {
  const index = await loadKb();
  return search(index, question, prev).hits.map((h: { chunk: GuideChunk }) => h.chunk);
}

export function toSource(c: GuideChunk): Source {
  return {
    id: c.id,
    title: c.title,
    section: c.heading || c.section,
    url: c.url,
    kind: c.source === "official" ? "official" : c.source === "community-tip" ? "tip" : "community",
  };
}
