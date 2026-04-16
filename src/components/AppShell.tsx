"use client";

import type { ReactNode } from "react";

import { BottomNav } from "@/components/BottomNav";
import { DecisionsProvider } from "@/context/decisions-context";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DecisionsProvider>
      <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <main className="flex min-h-0 flex-1 flex-col pb-[calc(5.25rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
    </DecisionsProvider>
  );
}
