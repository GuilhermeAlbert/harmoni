"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";

import {
  DEFAULT_THEME,
  SYSTEM_DARK_MODE_QUERY,
} from "./constants";
import { ThemeContext } from "./context";
import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  subscribeTheme,
} from "./helper";
import { Theme } from "@/lib/enums/theme";

export function ThemeProvider({
  children,
}: PropsWithChildren): React.ReactNode {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getStoredTheme,
    () => DEFAULT_THEME,
  );

  const setTheme = useCallback((nextTheme: Theme): void => {
    applyTheme(nextTheme);
    persistTheme(nextTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== Theme.System) {
      return;
    }

    const mediaQuery = window.matchMedia(SYSTEM_DARK_MODE_QUERY);
    const handleSystemThemeChange = (): void => applyTheme(Theme.System);

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
