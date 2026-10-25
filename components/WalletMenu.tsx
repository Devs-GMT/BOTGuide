"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { copyText } from "@/lib/clipboard";
import { useWallet } from "@/lib/wallet";

type Trigger = { address: string | null; busy: boolean; open: boolean; onClick: () => void };

/** Connect button that turns into a menu (copy address, change wallet, disconnect) once a wallet is connected. */
export default function WalletMenu({
  trigger,
  direction = "down",
  align = "right",
  className = "",
}: {
  trigger: (t: Trigger) => ReactNode;
  direction?: "up" | "down";
  align?: "left" | "right";
  className?: string;
}) {
  const { address, busy, connect, changeWallet, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const item = "block w-full rounded-lg px-3 py-2 text-left text-[13px] text-white/85 hover:bg-white/[0.07]";
  return (
    <div ref={ref} className={`relative ${className}`}>
      {trigger({ address, busy, open, onClick: address ? () => setOpen((o) => !o) : connect })}
      {open && address && (
        <div
          role="menu"
          className={`absolute z-50 w-52 rounded-xl bg-[#1c1c1c] p-1.5 shadow-xl ring-1 ring-white/10 ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } ${align === "left" ? "left-0" : "right-0"}`}
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={async () => {
              setCopied(await copyText(address));
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Address copied" : "Copy address"}
          </button>
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false);
              changeWallet();
            }}
          >
            Change wallet
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-[#ff6b6b] hover:bg-[#ff6b6b]/10"
            onClick={() => {
              setOpen(false);
              disconnect();
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
