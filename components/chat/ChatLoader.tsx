"use client";

import dynamic from "next/dynamic";

// The chat reads localStorage on first render, so it only runs in the browser.
const ChatApp = dynamic(() => import("./ChatApp"), {
  ssr: false,
  loading: () => <div className="h-dvh bg-bg" aria-busy="true" />,
});

export default function ChatLoader() {
  return <ChatApp />;
}
