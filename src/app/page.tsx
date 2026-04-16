"use client";

import { useCallback, useState } from "react";

import { ResultsBars } from "@/components/voting/ResultsBars";
import { VoteButtons } from "@/components/voting/VoteButtons";
import { BRAND_TAGLINE, BTN_PRIMARY } from "@/lib/product-ui";

type VoteChoice = "a" | "b";

type Decision = {
  id: string;
  category: string;
  question: string;
  optionA: { label: string; percent: number };
  optionB: { label: string; percent: number };
  topReason: string;
};

const MOCK_DECISIONS: Decision[] = [
  {
    id: "career-1",
    category: "Career",
    question: "Should I accept a remote role with less pay but more flexibility?",
    optionA: { label: "Take the remote offer", percent: 62 },
    optionB: { label: "Stay in-office for higher pay", percent: 38 },
    topReason:
      "Most voters prioritized work–life balance and long-term sanity over a short-term salary bump.",
  },
  {
    id: "tech-1",
    category: "Tech",
    question: "For my next side project stack, should I double down on React or try Svelte?",
    optionA: { label: "Stick with React", percent: 71 },
    optionB: { label: "Try Svelte", percent: 29 },
    topReason:
      "Ecosystem and hiring momentum still edge out novelty for a portfolio piece you need to ship.",
  },
  {
    id: "money-1",
    category: "Money",
    question: "I have $5k saved — should I invest it now or build a bigger emergency fund first?",
    optionA: { label: "Pad emergency fund first", percent: 54 },
    optionB: { label: "Start investing now", percent: 46 },
    topReason:
      "Voters favored sleeping better at night before taking market risk with cash you might need soon.",
  },
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<VoteChoice | null>(null);

  const decision = MOCK_DECISIONS[index];
  const hasVoted = choice !== null;

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % MOCK_DECISIONS.length);
    setChoice(null);
  }, []);

  const pick = (c: VoteChoice) => {
    if (hasVoted) return;
    setChoice(c);
  };

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-zinc-100 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="w-full max-w-[400px]">
        <header className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            DecideMe
          </p>
          <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {BRAND_TAGLINE}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Feed
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            Curated dilemmas—pick a side, see how others lean and why, then move to
            the next card.
          </p>
        </header>

        <article
          className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
          aria-live="polite"
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800 dark:bg-violet-950/80 dark:text-violet-200">
              {decision.category}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Anonymous
            </span>
          </div>

          <h2 className="text-xl font-bold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            {decision.question}
          </h2>

          <VoteButtons
            options={[decision.optionA.label, decision.optionB.label]}
            disabled={hasVoted}
            onVote={(i) => pick(i === 0 ? "a" : "b")}
            optionKeyPrefix={decision.id}
            variant="feed"
          />

          {hasVoted && (
            <div className="mt-8 space-y-5 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <ResultsBars
                resultKeyPrefix={decision.id}
                showVoteCounts={false}
                bars={[
                  {
                    label: decision.optionA.label,
                    percent: decision.optionA.percent,
                    highlight: choice === "a",
                  },
                  {
                    label: decision.optionB.label,
                    percent: decision.optionB.percent,
                    highlight: choice === "b",
                  },
                ]}
              />

              <p className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Top reason:{" "}
                </span>
                {decision.topReason}
              </p>

              <button type="button" onClick={goNext} className={BTN_PRIMARY}>
                Next card
              </button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
