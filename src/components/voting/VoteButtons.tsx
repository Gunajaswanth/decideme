"use client";

type VoteButtonsProps = {
  options: string[];
  disabled: boolean;
  selectedOptionIndex?: number | null;
  onVote: (optionIndex: number) => void;
  /** Prefix for stable React keys (e.g. decision id). */
  optionKeyPrefix: string;
  variant?: "feed" | "community";
};

const BTN_CLASS_FEED =
  "flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-left text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:border-violet-500 dark:hover:bg-violet-950/40";

const BTN_CLASS_COMMUNITY =
  "flex-1 min-w-[40%] rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-left text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:border-violet-500 dark:hover:bg-violet-950/40";

export function VoteButtons({
  options,
  disabled,
  selectedOptionIndex,
  onVote,
  optionKeyPrefix,
  variant = "community",
}: VoteButtonsProps) {
  const wrapClass =
    variant === "feed"
      ? "mt-6 flex flex-col gap-3 sm:flex-row sm:gap-3"
      : "mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3";
  const btnClass = variant === "feed" ? BTN_CLASS_FEED : BTN_CLASS_COMMUNITY;

  return (
    <div className={wrapClass}>
      {options.map((opt, i) => (
        <button
          key={`${optionKeyPrefix}-vote-${i}`}
          type="button"
          disabled={disabled}
          aria-pressed={
            selectedOptionIndex === undefined || selectedOptionIndex === null
              ? undefined
              : selectedOptionIndex === i
          }
          onClick={() => onVote(i)}
          className={btnClass}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
