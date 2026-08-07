import { X } from "lucide-react";

import type { DashboardSidebarProps } from "./types";
import { Brand } from "@/components/brand";
import { IconButton } from "@/components/icon-button";
import { DashboardNavigation } from "@/components/layouts/dashboard/navigation";

export function DashboardSidebar({
  className = "",
  messages,
  onClose,
  onNavigate,
  pathname,
}: DashboardSidebarProps): React.ReactNode {
  return (
    <aside
      className={`flex h-dvh min-h-0 w-60 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-white/[0.07] dark:bg-[#0c0c0c] ${className}`}
    >
      <div className="flex items-start justify-between gap-3 px-5 py-6">
        <Brand />
        {onClose ? (
          <IconButton
            accessibleName={messages.navigation.closeMenu}
            icon={X}
            onClick={onClose}
          />
        ) : null}
      </div>

      <div className="px-3">
        <p className="px-3 pb-2 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {messages.navigation.workspace}
        </p>
        <DashboardNavigation
          messages={messages}
          onNavigate={onNavigate}
          pathname={pathname}
        />
      </div>
    </aside>
  );
}
