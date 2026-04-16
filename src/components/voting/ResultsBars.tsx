"use client";

export type ResultsBarItem = {
  label: string;
  percent: number;
  highlight: boolean;
  /** When `showVoteCounts` is true, used for display and accessibility. */
  voteCount?: number;
};

type ResultsBarsProps = {
  bars: ResultsBarItem[];
  showVoteCounts: boolean;
  resultKeyPrefix: string;
};

export function ResultsBars({
  bars,
  showVoteCounts,
  resultKeyPrefix,
}: ResultsBarsProps) {
  return (
    <div className="space-y-4">
      {bars.map((bar, i) => (
        <ResultBarRow
          key={`${resultKeyPrefix}-result-${i}`}
          label={bar.label}
          percent={bar.percent}
          highlight={bar.highlight}
          voteCount={bar.voteCount}
          showVoteCounts={showVoteCounts}
        />
      ))}
    </div>
  );
}

function ResultBarRow({
  label,
  percent,
  highlight,
  voteCount,
  showVoteCounts,
}: ResultsBarItem & { showVoteCounts: boolean }) {
  const count = voteCount ?? 0;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
        <span
          className={
            highlight
              ? showVoteCounts
                ? "min-w-0 font-semibold text-violet-700 dark:text-violet-300"
                : "font-semibold text-violet-700 dark:text-violet-300"
              : showVoteCounts
                ? "min-w-0 font-medium text-zinc-600 dark:text-zinc-400"
                : "font-medium text-zinc-600 dark:text-zinc-400"
          }
        >
          {label}
        </span>
        {showVoteCounts ? (
          <span className="shrink-0 text-right tabular-nums text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">{percent}%</span>
            <span className="mx-1 text-zinc-400 dark:text-zinc-500">·</span>
            <span>
              {count} {count === 1 ? "vote" : "votes"}
            </span>
          </span>
        ) : (
          <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
            {percent}%
          </span>
        )}
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          showVoteCounts
            ? `${label}, ${percent} percent, ${count} votes`
            : label
        }
      >
        <div
          className={
            highlight
              ? "h-full rounded-full bg-violet-500 transition-[width] duration-500 ease-out dark:bg-violet-400"
              : "h-full rounded-full bg-zinc-400 transition-[width] duration-500 ease-out dark:bg-zinc-500"
          }
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
