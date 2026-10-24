import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "./Reveal";

export function Logo({ size = 22, word = true }: { size?: number; word?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden><path d="M32 21V12" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><circle cx="32" cy="9" r="5.5" fill="#2fdba6"/><rect x="4" y="31" width="6" height="12" rx="3" fill="currentColor"/><rect x="54" y="31" width="6" height="12" rx="3" fill="currentColor"/><rect x="10" y="21" width="44" height="32" rx="14" fill="currentColor"/><path d="M15 50 13 61 27 52Z" fill="currentColor"/><rect x="21" y="31" width="7" height="11" rx="3.5" fill="#0a0a0a"/><rect x="36" y="31" width="7" height="11" rx="3.5" fill="#0a0a0a"/><path d="M27 46.5q5 3 10 0" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" fill="none"/></svg>
      {word && <span className="text-[17px] font-medium tracking-tight">BOTGuide</span>}
    </span>
  );
}

type PillProps = {
  href?: string;
  onClick?: () => void;
  tone?: "white" | "dark" | "outline";
  size?: "sm" | "md";
  full?: boolean;
  external?: boolean;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function Pill({
  href,
  onClick,
  tone = "white",
  size = "md",
  full,
  external,
  children,
  className = "",
  type = "button",
  disabled,
}: PillProps) {
  const tones = {
    white: "bg-white text-[#0a0a0a] hover:bg-white/85",
    dark: "bg-pill text-white hover:bg-[#333]",
    outline: "border border-white/20 text-white hover:bg-white/10",
  } as const;
  const sizes = { sm: "px-[18px] py-2.5", md: "px-5 py-3" } as const;
  const cls = `inline-flex items-center justify-center gap-1.5 rounded-full text-[14px] font-medium transition-[background-color,transform] duration-150 ease-[var(--ease-ui)] active:scale-[0.97] disabled:opacity-50 ${tones[tone]} ${sizes[size]} ${full ? "w-full" : ""} ${className}`;
  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className={className} aria-hidden>
      <path d="m2 3.5 3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function External({ className = "" }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={className} aria-hidden>
      <path d="M3 7l4-4M3.8 3H7v3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path d="m3 7.4 2.8 2.8L11 4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Container({
  children,
  className = "",
  id,
  tight,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tight?: boolean;
}) {
  return (
    <section id={id} className={className}>
      <div className={`mx-auto w-full max-w-[1280px] px-4 lg:px-6 ${tight ? "py-6" : "py-16 sm:py-24"}`}>
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-[13px] text-muted">{children}</p>;
}

/** The heading every ordinary section starts with: a small label, then the title, both left-aligned. */
export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <Reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">{title}</h2>
      {children && <p className="mt-4 max-w-xl text-[16px] leading-7 text-muted">{children}</p>}
    </Reveal>
  );
}

/** Window chrome with traffic lights, used for terminals and code. */
export function Window({
  title,
  right,
  children,
  className = "",
}: {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-xl bg-[#141414] ring-1 ring-white/[0.06] ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        {title && <span className="ml-3 font-mono text-[12px] text-muted">{title}</span>}
        <span className="ml-auto">{right}</span>
      </div>
      {children}
    </div>
  );
}
