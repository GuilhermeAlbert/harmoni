"use client";

import type { PagePlaceholderProps } from "./types";
import { Panel } from "@/components/panel";
import { DASHBOARD_ROUTES } from "@/lib/constants/dashboard-routes";
import { useLanguage } from "@/contexts/language/use-language";

export function PagePlaceholder({
  path,
}: PagePlaceholderProps): React.ReactNode {
  const { messages } = useLanguage();
  const route =
    DASHBOARD_ROUTES.find((dashboardRoute) => dashboardRoute.path === path) ??
    DASHBOARD_ROUTES[0];
  const routeMessages = messages.routes[route.messageKey];

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {messages.routePlaceholder.eyebrow}
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-geist)] text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
          {routeMessages.label}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {routeMessages.subtitle}
        </p>

        <Panel className="mt-8 p-6 sm:p-8">
          <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {messages.routePlaceholder.description}
          </p>
        </Panel>
      </div>
    </main>
  );
}

