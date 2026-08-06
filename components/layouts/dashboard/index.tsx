"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import type { DashboardLayoutProps } from "./types";
import { DashboardMobileHeader } from "./mobile-header";
import { DashboardSidebar } from "./sidebar";
import { DASHBOARD_ROUTES } from "@/lib/constants/dashboard-routes";
import { useLanguage } from "@/contexts/language/use-language";

const MOBILE_NAVIGATION_ID = "mobile-dashboard-navigation";

export function DashboardLayout({
  children,
}: DashboardLayoutProps): React.ReactNode {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { messages } = useLanguage();

  const activeRoute =
    DASHBOARD_ROUTES.find((route) => route.path === pathname) ??
    DASHBOARD_ROUTES[0];
  const activeMessages = messages.routes[activeRoute.messageKey];

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    mobileNavigationRef.current
      ?.querySelector<HTMLElement>("button, a, select")
      ?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMobileNavigationOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        mobileNavigationRef.current?.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

      if (!focusableElements?.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [mobileNavigationOpen]);

  const closeMobileNavigation = (): void => {
    setMobileNavigationOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#090909] dark:text-zinc-100 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <DashboardSidebar
        className="hidden lg:flex"
        messages={messages}
        pathname={pathname}
      />

      <div className="min-w-0">
        <DashboardMobileHeader
          navigationControlsId={MOBILE_NAVIGATION_ID}
          navigationOpen={mobileNavigationOpen}
          onOpenNavigation={() => setMobileNavigationOpen(true)}
          openNavigationLabel={messages.navigation.openMenu}
          subtitle={activeMessages.subtitle}
          title={activeMessages.label}
        />
        {children}
      </div>

      {mobileNavigationOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden"
          id={MOBILE_NAVIGATION_ID}
          ref={mobileNavigationRef}
          role="dialog"
        >
          <button
            aria-label={messages.navigation.closeMenu}
            className="absolute inset-0 bg-black/55"
            onClick={closeMobileNavigation}
            type="button"
          />
          <DashboardSidebar
            className="relative z-10 shadow-2xl"
            messages={messages}
            onClose={closeMobileNavigation}
            onNavigate={closeMobileNavigation}
            pathname={pathname}
          />
        </div>
      ) : null}
    </div>
  );
}
