"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MAINNET } from "./config";

const reducedSubscribe = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function useReducedMotion() {
  return useSyncExternalStore(
    reducedSubscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * Elapsed milliseconds while `play` is true, finishing at `end`.
 * When not playing (or with reduced motion) it returns `end`, i.e. the final frame.
 */
export function useClock(play: boolean, end: number) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!play || reduced) return;
    const start = performance.now();
    let raf = 0;
    let last = -1;
    const loop = (now: number) => {
      const e = Math.min(end, now - start);
      const q = Math.floor(e / 33);
      if (q !== last) {
        last = q;
        setT(e);
      }
      if (e < end) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      setT(0);
    };
  }, [play, reduced, end]);

  return play && !reduced ? t : end;
}

/* ---------- live block height, one shared poller ---------- */

type BlockState = { block: number | null; error: boolean };
let state: BlockState = { block: null, error: false };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

async function poll() {
  try {
    const r = await fetch(MAINNET.rpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
    });
    const j = (await r.json()) as { result?: string };
    const n = j.result ? parseInt(j.result, 16) : NaN;
    state = Number.isFinite(n) ? { block: n, error: false } : { block: state.block, error: true };
  } catch {
    state = { block: state.block, error: true };
  }
  listeners.forEach((l) => l());
}

function subscribeBlock(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    poll();
    timer = setInterval(poll, 3000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const serverBlock: BlockState = { block: null, error: false };

export function useLiveBlock() {
  return useSyncExternalStore(subscribeBlock, () => state, () => serverBlock);
}

export function formatBlock(b: number | null) {
  return b === null ? "—" : b.toLocaleString("en-US");
}

/* ---------- section reveal on scroll ---------- */
export function useInView<T extends Element>(rootMargin = "0px 0px 12% 0px") {
  const [el, setEl] = useState<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el, seen, rootMargin]);
  return [setEl, seen] as const;
}
