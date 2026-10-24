"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@/lib/hooks";

/** Fades a block in once it scrolls into view. Content stays visible without JS motion. */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const [ref, seen] = useInView<HTMLElement>();
  const style: CSSProperties = { ["--d" as string]: `${delay}ms` };
  return (
    <Tag
      ref={ref as never}
      className={`${className} ${seen ? "enter" : "opacity-0"}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
