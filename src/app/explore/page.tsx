"use client";

import Link from "next/link";
import { ChevronDown, Compass, PenLine, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useDecisions } from "@/context/decisions-context";
import { BRAND_TAGLINE, BTN_PRIMARY, BTN_SECONDARY } from "@/lib/product-ui";
import type { SubmittedDecision } from "@/types/submitted-decision";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "Career", label: "Career" },
  { value: "Money", label: "Money" },
  { value: "Tech", label: "Tech" },
  { value: "Education", label: "Education" },
  { value: "Lifestyle", label: "Lifestyle" },
  { value: "Uncategorized", label: "Uncategorized" },
] as const;

type CategoryFilterValue = (typeof CATEGORY_OPTIONS)[number]["value"];

type SortValue = "newest" | "oldest" | "most_voted";

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-9 text-sm font-medium text-zinc-900 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:focus:border-violet-500 dark:focus:ring-violet-400/25";

const LABEL_CLASS =
  "block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400";

function totalVoteCount(d: SubmittedDecision): number {
  return d.voteCounts.reduce((a, b) => a + b, 0);
}

function matchesCategory(
  decision: SubmittedDecision,
  filter: CategoryFilterValue,
): boolean {
  if (filter === "all") return true;
  const cat = decision.category?.trim() ?? "";
  if (filter === "Uncategorized") return cat.length === 0;
  return cat.toLowerCase() === filter.toLowerCase();
}

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

function SubmittedDecisionCard({ decision }: { decision: SubmittedDecision }) {
  const visibility = decision.anonymous ? "Anonymous" : "Public";

  return (
    <Link
      href={`/decision/${decision.id}`}
      className="block rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.15)] outline-none transition hover:border-violet-200 hover:shadow-[0_16px_44px_-14px_rgba(0,0,0,0.2)] focus-visible:ring-2 focus-visible:ring-violet-500/40 active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)] dark:hover:border-violet-500/50 dark:hover:shadow-[0_16px_44px_-14px_rgba(0,0,0,0.5)]"
    >
      <article className="pointer-events-none">
        <div className="flex flex-wrap items-center gap-2">
          {decision.category ? (
            <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800 dark:bg-violet-950/80 dark:text-violet-200">
              {decision.category}
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              Uncategorized
            </span>
          )}
          <span
            className={
              decision.anonymous
                ? "inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                : "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
            }
          >
            {visibility}
          </span>
        </div>

        <h2 className="mt-3 text-base font-bold leading-snug text-zinc-900 dark:text-zinc-50">
          {decision.question}
        </h2>

        <ul className="mt-3 space-y-2">
          {decision.options.map((opt, i) => (
            <li
              key={`${decision.id}-opt-${i}`}
              className="flex gap-2 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-2.5 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
            >
              <span className="tabular-nums text-zinc-400 dark:text-zinc-500">
                {i + 1}.
              </span>
              <span className="min-w-0 flex-1">{opt}</span>
            </li>
          ))}
        </ul>

        {decision.context ? (
          <p className="mt-3 rounded-2xl bg-zinc-50 px-3 py-2.5 text-xs leading-relaxed text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Context:{" "}
            </span>
            {decision.context}
          </p>
        ) : null}

        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
          Submitted {formatSubmittedAt(decision.createdAt)}
        </p>
      </article>
    </Link>
  );
}

export default function ExplorePage() {
  const { submittedDecisions } = useDecisions();
  const hasDecisions = submittedDecisions.length > 0;

  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const visibleDecisions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = submittedDecisions.filter((d) =>
      matchesCategory(d, categoryFilter),
    );
    if (q) {
      list = list.filter((d) => d.question.toLowerCase().includes(q));
    }

    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else {
      sorted.sort((a, b) => totalVoteCount(b) - totalVoteCount(a));
    }
    return sorted;
  }, [submittedDecisions, categoryFilter, sort, searchQuery]);

  const hasVisible = visibleDecisions.length > 0;
  const filtersActive =
    categoryFilter !== "all" || sort !== "newest" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setCategoryFilter("all");
    setSort("newest");
    setSearchQuery("");
  };

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
            Explore
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            Everything you saved from Ask—tap a card to vote, add a reason, or
            share. Curated examples stay on Feed.
          </p>
        </header>

        {!hasDecisions ? (
          <div className="rounded-3xl border border-dashed border-zinc-300/90 bg-white/80 p-7 text-center shadow-[0_12px_40px_-16px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-900/80 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
              <Compass className="size-7" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
              Nothing here yet
            </h2>
            <p className="mt-2 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
              Post once from Ask and it appears here—vote, share, and iterate. Data
              stays in this browser.
            </p>
            <Link href="/ask" className={`${BTN_PRIMARY} mt-5`}>
              <PenLine className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
              New decision
            </Link>
            <p className="mt-4 text-xs leading-snug text-zinc-500 dark:text-zinc-500">
              Prefer samples first?{" "}
              <Link
                href="/"
                className="font-semibold text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
              >
                Open the Feed
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label htmlFor="explore-category" className={LABEL_CLASS}>
                    Category
                  </label>
                  <div className="relative mt-1">
                    <select
                      id="explore-category"
                      value={categoryFilter}
                      onChange={(e) =>
                        setCategoryFilter(e.target.value as CategoryFilterValue)
                      }
                      className={SELECT_CLASS}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <label htmlFor="explore-sort" className={LABEL_CLASS}>
                    Sort
                  </label>
                  <div className="relative mt-1">
                    <select
                      id="explore-sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortValue)}
                      className={SELECT_CLASS}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="most_voted">Most voted</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor="explore-search" className={LABEL_CLASS}>
                  Search
                </label>
                <div className="relative mt-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <input
                    id="explore-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by question…"
                    autoComplete="off"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-violet-500 dark:focus:ring-violet-400/25"
                  />
                </div>
              </div>
            </div>

            {!hasVisible ? (
              <div className="rounded-3xl border border-dashed border-zinc-300/90 bg-white/80 p-7 text-center shadow-[0_12px_40px_-16px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-900/80 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)]">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <Search className="size-7" strokeWidth={1.75} aria-hidden />
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
                  Nothing matches yet
                </h2>
                <p className="mt-2 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
                  Adjust filters or search—or add a fresh post from Ask.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  {filtersActive ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={BTN_SECONDARY}
                    >
                      Clear filters
                    </button>
                  ) : null}
                  <Link href="/ask" className={BTN_PRIMARY}>
                    <PenLine className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                    New decision
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visibleDecisions.map((d) => (
                  <SubmittedDecisionCard key={d.id} decision={d} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
