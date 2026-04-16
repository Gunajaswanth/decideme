/** Shared DecideMe UI tokens — keep CTAs and rhythm consistent app-wide. */

export const BRAND_TAGLINE = "Decide with the crowd.";

/** Primary action (full-width on mobile). */
export const BTN_PRIMARY =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-500 hover:shadow-lg active:scale-[0.98] dark:bg-violet-500 dark:hover:bg-violet-400";

/** Secondary / outline action. */
export const BTN_SECONDARY =
  "inline-flex w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 active:scale-[0.99] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-violet-500 dark:hover:bg-violet-950/40";

/** Compact top-bar control (Share, etc.). */
export const BTN_COMPACT =
  "inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-violet-500 dark:hover:bg-violet-950/40";

/** Append to `BTN_PRIMARY` when the control can be disabled. */
export const BTN_DISABLED =
  "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";
