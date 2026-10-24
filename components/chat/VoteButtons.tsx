"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { answerIdFor, contractReady, explainError, fetchVote, rateAnswer, type VoteState } from "@/lib/contract";
import { useWallet } from "@/lib/wallet";
import { IconThumbDown, IconThumbUp } from "./icons";

export default function VoteButtons({ question, answer }: { question: string; answer: string }) {
  const { hasProvider, address, connect } = useWallet();
  const answerId = useMemo(() => answerIdFor(question, answer), [question, answer]);
  const [vote, setVote] = useState<VoteState | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!contractReady) return;
    try {
      setVote(await fetchVote(answerId, address));
    } catch {
      /* counts just stay hidden */
    }
  }, [answerId, address]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const rate = async (helpful: boolean) => {
    if (!contractReady) return setNote("Rating opens once the BOTGuide contract is deployed. Your vote was not recorded.");
    if (!address) {
      if (!hasProvider) return setNote("Install MetaMask to rate answers.");
      setNote("Connect your wallet to rate this answer.");
      return connect();
    }
    setBusy(true);
    try {
      await rateAnswer(answerId, helpful, (s) => setNote(s === "confirm" ? "Confirm in wallet…" : "Waiting for confirmation…"));
      setNote("Thanks, your vote is on-chain.");
      await load();
    } catch (e) {
      setNote(explainError(e));
    } finally {
      setBusy(false);
    }
  };

  const voted = (vote?.mine ?? 0) !== 0;
  const btn = (helpful: boolean) => {
    const mine = vote?.mine === (helpful ? 1 : 2);
    const count = vote ? (helpful ? vote.up : vote.down) : null;
    return (
      <button
        type="button"
        aria-label={helpful ? "Helpful" : "Not helpful"}
        title={voted ? "You already voted" : helpful ? "Helpful" : "Not helpful"}
        aria-pressed={mine}
        disabled={busy || voted}
        onClick={() => rate(helpful)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12.5px] transition-colors duration-150 disabled:cursor-default ${
          mine ? "bg-white/[0.12] text-white" : "text-muted hover:bg-white/[0.06] hover:text-white disabled:opacity-50 disabled:hover:bg-transparent"
        }`}
      >
        {helpful ? <IconThumbUp size={15} /> : <IconThumbDown size={15} />}
        {count !== null && <span className="font-mono">{count}</span>}
      </button>
    );
  };

  return (
    <>
      {btn(true)}
      {btn(false)}
      {note && (
        <span role="status" className="px-2 text-[12.5px] text-muted">
          {note}
        </span>
      )}
    </>
  );
}
