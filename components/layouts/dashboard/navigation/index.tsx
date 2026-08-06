import Link from "next/link";

import type { DashboardNavigationProps } from "./types";
import { DASHBOARD_ROUTES } from "@/lib/constants/dashboard-routes";

export function DashboardNavigation({
  messages,
  onNavigate,
  pathname,
}: DashboardNavigationProps): React.ReactNode {
  return (
    <nav aria-label={messages.navigation.mainLabel}>
      <ul className="grid gap-1">
        {DASHBOARD_ROUTES.map(({ icon: Icon, messageKey, path }) => {
          const active = pathname === path;
          const label = messages.routes[messageKey].label;

          return (
            <li key={path}>
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-white ${active ? "bg-zinc-200 text-zinc-950 dark:bg-white/10 dark:text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-200"}`}
                href={path}
                onNavigate={onNavigate}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

