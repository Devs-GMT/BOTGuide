import { LIMITS, buildMessages, type GuideChunk, type GuideMessage, type GuideRequest } from "@/lib/guide";

// Answers stream for a few seconds; this keeps a slow Groq reply from being cut off on Vercel.
export const maxDuration = 60;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// 30 questions per IP per hour. With UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN set the counter
// is shared across instances; without them it lives in memory (per instance, fine for local and demos).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, { n: number; reset: number }>();

function limited(ip: string) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || rec.reset < now) {
    hits.set(ip, { n: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    return false;
  }
  rec.n += 1;
  return rec.n > MAX_PER_WINDOW;
}

async function sharedCount(ip: string): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const key = `botguide:rl:${ip}`;
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, String(WINDOW_MS / 1000), "NX"]]),
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    const out = (await res.json()) as { result?: number }[];
    return typeof out[0]?.result === "number" ? out[0].result : null;
  } catch {
    return null; // store unreachable: fall back to the in-memory counter
  }
}

async function isLimited(ip: string) {
  const n = await sharedCount(ip);
  return n === null ? limited(ip) : n > MAX_PER_WINDOW;
}

function bad(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

function validate(body: unknown): GuideRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.question !== "string" || !b.question.trim() || b.question.length > LIMITS.question) return null;
  if (!Array.isArray(b.history) || !Array.isArray(b.chunks)) return null;
  if (b.history.length > LIMITS.history || b.chunks.length > LIMITS.chunks) return null;

  const history: GuideMessage[] = [];
  for (const m of b.history) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    history.push({ role: m.role, content: m.content });
  }
  const chunks: GuideChunk[] = [];
  for (const c of b.chunks) {
    if (!c || typeof c.id !== "string" || typeof c.text !== "string") return null;
    chunks.push({
      id: c.id,
      title: String(c.title ?? ""),
      heading: String(c.heading ?? ""),
      section: String(c.section ?? ""),
      source: String(c.source ?? "official"),
      url: String(c.url ?? ""),
      text: c.text,
    });
  }
  return { question: b.question.trim(), history, chunks };
}

export async function POST(req: Request) {
  // Same-origin only: the browser app is the only caller.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return bad("forbidden", 403);

  const key = process.env.GROQ_API_KEY;
  if (!key) return bad("not_configured", 503);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (await isLimited(ip)) return bad("rate_limited", 429);

  let parsed: GuideRequest | null = null;
  try {
    parsed = validate(await req.json());
  } catch {
    /* handled below */
  }
  if (!parsed) return bad("invalid_request", 400);

  let upstream: Response;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: buildMessages(parsed),
        stream: true,
        temperature: 0.2,
        max_tokens: 1400,
        reasoning_effort: process.env.GROQ_REASONING || "low",
      }),
      signal: req.signal,
    });
  } catch {
    return bad("upstream_unreachable", 502);
  }
  if (!upstream.ok || !upstream.body) return bad("upstream_error", 502);

  // Groq streams server-sent events. The browser gets plain text only.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          let out = "";
          let nl: number;
          while ((nl = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const delta = JSON.parse(data).choices?.[0]?.delta?.content;
              if (typeof delta === "string") out += delta;
            } catch {
              /* partial line, ignore */
            }
          }
          if (out) {
            controller.enqueue(encoder.encode(out));
            return;
          }
        }
      } catch {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
