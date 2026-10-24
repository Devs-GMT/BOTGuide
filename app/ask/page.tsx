import type { Metadata } from "next";
import ChatLoader from "@/components/chat/ChatLoader";

export const metadata: Metadata = {
  title: "Ask BOTGuide",
  description: "Ask anything about building on BOT Chain.",
};

export default function AskPage() {
  return <ChatLoader />;
}
