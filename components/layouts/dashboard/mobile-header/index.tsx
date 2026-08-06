import { Menu } from "lucide-react";

import type { DashboardMobileHeaderProps } from "./types";
import { Brand } from "@/components/brand";
import { IconButton } from "@/components/icon-button";

export function DashboardMobileHeader({
  navigationControlsId,
  navigationOpen,
  onOpenNavigation,
  openNavigationLabel,
  subtitle,
  title,
}: DashboardMobileHeaderProps): React.ReactNode {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#090909]/95 lg:hidden">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton
            accessibleName={openNavigationLabel}
            aria-controls={navigationControlsId}
            aria-expanded={navigationOpen}
            icon={Menu}
            onClick={onOpenNavigation}
          />
          <div className="min-w-0">
            <h1 className="truncate font-[family-name:var(--font-geist)] text-base font-semibold">
              {title}
            </h1>
            <p className="mt-0.5 hidden truncate text-xs text-zinc-500 sm:block">
              {subtitle}
            </p>
          </div>
        </div>
        <Brand compact />
      </div>
    </header>
  );
}
