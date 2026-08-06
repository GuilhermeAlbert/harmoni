import {
  DEFAULT_THEME,
  SYSTEM_DARK_MODE_QUERY,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
} from "./constants";
import { Theme } from "@/lib/enums/theme";

export function isTheme(value: string | null): value is Theme {
  return Object.values(Theme).some((theme) => theme === value);
}

export function getStoredTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
}

export function getSystemPrefersDark(): boolean {
  return window.matchMedia(SYSTEM_DARK_MODE_QUERY).matches;
}

export function resolveThemeIsDark(theme: Theme): boolean {
  if (theme === Theme.System) {
    return getSystemPrefersDark();
  }

  return theme === Theme.Dark;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", resolveThemeIsDark(theme));
}

export function persistTheme(theme: Theme): void {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function subscribeTheme(onStoreChange: () => void): () => void {
  const handleStorageChange = (event: StorageEvent): void => {
    if (event.key === THEME_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}
