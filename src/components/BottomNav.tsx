"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CirclePlus, Compass, Home, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const ITEMS: NavItem[] = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/ask", label: "Ask", icon: CirclePlus },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Main navigation"
    >
      <div className="mx-auto w-full max-w-[400px]">
        <div className="flex items-stretch justify-between gap-1 rounded-2xl border border-zinc-200/90 bg-white/90 px-1 py-2 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.4)]">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl bg-violet-100 py-2 text-violet-800 transition-colors dark:bg-violet-950/80 dark:text-violet-200"
                    : "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 active:scale-[0.97] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }
              >
                <Icon
                  className="size-5 shrink-0"
                  strokeWidth={active ? 2.25 : 2}
                  aria-hidden
                />
                <span className="max-w-full truncate px-0.5 text-[10px] font-semibold leading-tight">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
