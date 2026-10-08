"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pagePaths } from "@/config/paths";
import { SignOutButton } from "@/components/auth/SignOutButton";

const NAV_ITEMS = [
  { label: "Warehouse", href: pagePaths.warehouse },
  { label: "Machine", href: pagePaths.machines },
  { label: "New Installations", href: pagePaths.newInstallations },
];

const itemBase =
  "whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium transition-colors sm:px-3 sm:text-sm " +
  "focus-visible:outline-2 focus-visible:outline-focus-ring";

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface sm:h-16">
      <div className="mx-auto flex h-full max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 sm:flex-nowrap sm:px-4 sm:py-0">
        <Link
          href={pagePaths.warehouse}
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          <span
            aria-hidden="true"
            className="stat-violet flex size-9 items-center justify-center rounded-xl text-base font-bold text-white"
          >
            S
          </span>
          <span className="text-lg font-semibold tracking-tight">SmartStock</span>
        </Link>

        <nav aria-label="Main" className="order-last flex w-full min-w-0 items-center justify-between gap-0.5 overflow-x-auto sm:order-none sm:w-auto sm:justify-start sm:gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${itemBase} ${
                  active ? "bg-primary text-primary-foreground" : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <SignOutButton
            className={`${itemBase} text-muted hover:bg-danger-surface hover:text-danger disabled:opacity-60`}
          />
        </nav>
      </div>
    </header>
  );
}
