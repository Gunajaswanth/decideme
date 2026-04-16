import Link from "next/link";

import { BRAND_TAGLINE, BTN_SECONDARY } from "@/lib/product-ui";

export default function AlertsPage() {
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
            Alerts
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            Vote bumps and milestones will land here—we&apos;re still wiring
            notifications.
          </p>
        </header>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
          <p className="text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            You&apos;re all caught up. Open Explore for your posts or Profile for a
            quick summary until alerts go live.
          </p>
          <Link href="/explore" className={`${BTN_SECONDARY} mt-5`}>
            Open Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
