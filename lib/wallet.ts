"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Network } from "./config";

type Eth = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, cb: (...args: unknown[]) => void): void;
  removeListener?(event: string, cb: (...args: unknown[]) => void): void;
};

declare global {
  interface Window {
    ethereum?: Eth;
  }
}

export async function addNetwork(net: Network) {
  const eth = window.ethereum;
  if (!eth) throw new Error("no-provider");
  await eth.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: net.hex,
        chainName: net.name,
        nativeCurrency: { name: net.symbol, symbol: net.symbol, decimals: 18 },
        rpcUrls: [net.rpc],
        blockExplorerUrls: [net.explorer],
      },
    ],
  });
}

// Some wallets inject window.ethereum after hydration, so re-check shortly after load.
function subscribeProvider(cb: () => void) {
  window.addEventListener("ethereum#initialized", cb);
  window.addEventListener("focus", cb);
  const timers = [setTimeout(cb, 400), setTimeout(cb, 1500), setTimeout(cb, 4000)];
  return () => {
    window.removeEventListener("ethereum#initialized", cb);
    window.removeEventListener("focus", cb);
    timers.forEach(clearTimeout);
  };
}

export function useHasProvider() {
  return useSyncExternalStore(
    subscribeProvider,
    () => typeof window !== "undefined" && !!window.ethereum,
    () => false,
  );
}

export function useChainId() {
  const hasProvider = useHasProvider();
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    eth
      .request({ method: "eth_chainId" })
      .then((v) => setId(parseInt(v as string, 16)))
      .catch(() => {});
    const onChange = (...args: unknown[]) => setId(parseInt(args[0] as string, 16));
    eth.on?.("chainChanged", onChange);
    return () => eth.removeListener?.("chainChanged", onChange);
  }, [hasProvider]);

  return id;
}

export function useWallet() {
  const hasProvider = useHasProvider();
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    eth
      .request({ method: "eth_accounts" })
      .then((a) => setAddress((a as string[])[0] ?? null))
      .catch(() => {});
    const onChange = (...args: unknown[]) =>
      setAddress(((args[0] as string[]) ?? [])[0] ?? null);
    eth.on?.("accountsChanged", onChange);
    return () => eth.removeListener?.("accountsChanged", onChange);
  }, [hasProvider]);

  const connect = useCallback(async () => {
    const eth = window.ethereum;
    if (!eth) return;
    setBusy(true);
    try {
      const a = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      setAddress(a[0] ?? null);
    } catch {
      /* user rejected */
    } finally {
      setBusy(false);
    }
  }, []);

  return { hasProvider, address, busy, connect };
}
