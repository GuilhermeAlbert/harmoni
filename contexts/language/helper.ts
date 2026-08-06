import {
  DEFAULT_LOCALE,
  LOCALE_CHANGE_EVENT,
  LOCALE_STORAGE_KEY,
} from "./constants";
import { isLocale } from "@/lib/i18n/get-messages";
import type { Locale } from "@/lib/enums/locale";

export function getStoredLocale(): Locale {
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

  return isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
}

export function applyDocumentLocale(locale: Locale): void {
  document.documentElement.lang = locale;
}

export function persistLocale(locale: Locale): void {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
}

export function subscribeLocale(onStoreChange: () => void): () => void {
  const handleStorageChange = (event: StorageEvent): void => {
    if (event.key === LOCALE_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

