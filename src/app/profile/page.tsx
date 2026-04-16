"use client";

import Link from "next/link";
import { PenLine, Share2, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { useDecisions } from "@/context/decisions-context";
import { BRAND_TAGLINE, BTN_PRIMARY } from "@/lib/product-ui";
import { useDecisionShare } from "@/hooks/use-decision-share";
import type { SubmittedDecision } from "@/types/submitted-decision";

function categoryLabel(d: SubmittedDecision): string {
  const c = d.category?.trim() ?? "";
  return c.length > 0 ? c : "Uncategorized";
}

function totalVotesForDecision(d: SubmittedDecision): number {
  return d.voteCounts.reduce((a, b) => a + b, 0);
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
      <p className="text-[10px] font-semibold uppercase leading-snug tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { submittedDecisions } = useDecisions();
  const { shareFeedback, shareDecision } = useDecisionShare();

  const {
    submittedCount,
    votesReceived,
    reasonsCount,
    distinctCategoriesCount,
    categoryRows,
    featuredDecision,
  } = useMemo(() => {
    const decisions = submittedDecisions;
    const submittedCount = decisions.length;

    const votesReceived = decisions.reduce(
      (sum, d) => sum + totalVotesForDecision(d),
      0,
    );
    const reasonsCount = decisions.reduce(
      (sum, d) => sum + d.reasons.length,
      0,
    );

    const categoryBuckets = new Map<string, number>();
    for (const d of decisions) {
      const key = categoryLabel(d);
      categoryBuckets.set(key, (categoryBuckets.get(key) ?? 0) + 1);
    }
    const distinctCategoriesCount = categoryBuckets.size;

    const sortedCategories = [...categoryBuckets.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });
    const maxCat = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;
    const categoryRows = sortedCategories.map(([name, count]) => ({
      name,
      count,
      barPct: maxCat > 0 ? Math.round((count / maxCat) * 100) : 0,
    }));

    let topDecision: SubmittedDecision | null = null;
    for (const d of decisions) {
      if (!topDecision) {
        topDecision = d;
        continue;
      }
      const v = totalVotesForDecision(d);
      const tv = totalVotesForDecision(topDecision);
      if (v > tv) topDecision = d;
      else if (v === tv && d.createdAt > topDecision.createdAt) topDecision = d;
    }

    const featuredDecision =
      submittedCount === 0
        ? null
        : (topDecision ?? decisions[0] ?? null);

    return {
      submittedCount,
      votesReceived,
      reasonsCount,
      distinctCategoriesCount,
      categoryRows,
      featuredDecision,
    };
  }, [submittedDecisions]);

  const hasDecisions = submittedCount > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-[400px]">
        <header className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            DecideMe
          </p>
          <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {BRAND_TAGLINE}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Profile
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            Totals, categories, and your top post—updates as you vote and add
            reasons. Saved on this device only.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-snug text-zinc-500 dark:text-zinc-400">
            This is a local-first MVP. Your activity is saved on this device only.
          </p>
        </header>

        {shareFeedback ? (
          <p
            className="mb-4 rounded-xl bg-emerald-100 px-3 py-2 text-center text-xs font-medium text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200"
            role="status"
            aria-live="polite"
          >
            {shareFeedback}
          </p>
        ) : null}

        {!hasDecisions ? (
          <div className="rounded-3xl border border-dashed border-zinc-300/90 bg-white/80 p-7 text-center shadow-[0_12px_40px_-16px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-900/80 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
              <Sparkles className="size-7" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
              Stats appear after your first post
            </h2>
            <p className="mt-2 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
              Start on Ask—this page fills in with totals, categories, and momentum
              as you vote and leave reasons.
            </p>
            <Link href="/ask" className={`${BTN_PRIMARY} mt-5`}>
              <PenLine className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
              New decision
            </Link>
            <p className="mt-4 text-xs leading-snug text-zinc-500 dark:text-zinc-500">
              Looking for a post?{" "}
              <Link
                href="/explore"
                className="font-semibold text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
              >
                Check Explore
              </Link>
            </p>
          </div>
        ) : featuredDecision ? (
          <div className="space-y-6">
            <section aria-label="Summary statistics">
              <h2 className="sr-only">Summary statistics</h2>
              <div className="grid grid-cols-2 gap-2.5">
                <StatCard label="Decisions submitted" value={submittedCount} />
                <StatCard label="Total votes received" value={votesReceived} />
                <StatCard label="Reasons added" value={reasonsCount} />
                <StatCard label="Categories used" value={distinctCategoriesCount} />
              </div>
            </section>

            <section
              className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)]"
              aria-label="Category breakdown"
            >
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
                By category
              </h2>
              <ul className="mt-4 space-y-3">
                {categoryRows.map((row) => (
                  <li key={row.name}>
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-100">
                        {row.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                        {row.count}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-[width] duration-500 ease-out dark:bg-violet-400"
                        style={{ width: `${row.barPct}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)]"
              aria-label="Top decision"
            >
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
                Top decision
              </h2>
              <p className="mt-3 text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-50">
                {featuredDecision.question}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {categoryLabel(featuredDecision) === "Uncategorized" ? (
                  <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Uncategorized
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800 dark:bg-violet-950/80 dark:text-violet-200">
                    {categoryLabel(featuredDecision)}
                  </span>
                )}
                <span className="text-xs font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
                  {totalVotesForDecision(featuredDecision)}{" "}
                  {totalVotesForDecision(featuredDecision) === 1
                    ? "vote"
                    : "votes"}{" "}
                  total
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <Link
                  href={`/decision/${featuredDecision.id}`}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-violet-300 hover:bg-violet-50 active:scale-[0.99] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-violet-500 dark:hover:bg-violet-950/40"
                >
                  View decision
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    void shareDecision(
                      featuredDecision.id,
                      featuredDecision.question,
                    )
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 active:scale-[0.99] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-violet-500 dark:hover:bg-violet-950/40"
                >
                  <Share2
                    className="size-4 shrink-0 text-violet-600 dark:text-violet-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                  Share decision
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
