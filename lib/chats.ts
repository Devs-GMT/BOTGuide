import type { AnswerKind } from "./answer";
import type { Source } from "./search";

export type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
  kind?: AnswerKind;
  sources?: Source[];
  general?: boolean;
  followUps?: string[];
  status?: "streaming" | "done" | "stopped" | "error";
  phase?: string;
};

export type Chat = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Msg[];
};

const KEY = "botguide.chats.v1";
const SETTINGS_KEY = "botguide.settings.v1";

export function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Returns null when storage is unavailable (private window, blocked site data). */
export function loadChats(): Chat[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Chat[]) : [];
    return list.map((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.status === "streaming" ? { ...m, status: "stopped" as const } : m)),
    }));
  } catch {
    return null;
  }
}

export function saveChats(chats: Chat[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(chats));
    return true;
  } catch {
    return false;
  }
}

export type Settings = { factsOpen: boolean };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return { factsOpen: true, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { factsOpen: true };
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* settings just won't persist */
  }
}

export function titleFrom(question: string) {
  const t = question.trim().replace(/\s+/g, " ");
  return t.length > 42 ? `${t.slice(0, 40)}…` : t;
}

const DAY = 86_400_000;

export function groupChats(chats: Chat[], now = Date.now()) {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const groups: { label: string; chats: Chat[] }[] = [
    { label: "Today", chats: [] },
    { label: "Yesterday", chats: [] },
    { label: "Previous 7 days", chats: [] },
    { label: "Older", chats: [] },
  ];
  for (const c of [...chats].sort((a, b) => b.updatedAt - a.updatedAt)) {
    if (c.updatedAt >= startOfToday) groups[0].chats.push(c);
    else if (c.updatedAt >= startOfToday - DAY) groups[1].chats.push(c);
    else if (c.updatedAt >= startOfToday - 7 * DAY) groups[2].chats.push(c);
    else groups[3].chats.push(c);
  }
  return groups.filter((g) => g.chats.length > 0);
}
