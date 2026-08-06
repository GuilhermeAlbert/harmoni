"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";

import {
  applyDocumentLocale,
  getStoredLocale,
  persistLocale,
  subscribeLocale,
} from "./helper";
import { DEFAULT_LOCALE } from "./constants";
import { LanguageContext } from "./context";
import { getMessages } from "@/lib/i18n/get-messages";
import type { Locale } from "@/lib/enums/locale";

export function LanguageProvider({
  children,
}: PropsWithChildren): React.ReactNode {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getStoredLocale,
    () => DEFAULT_LOCALE,
  );

  const setLocale = useCallback((nextLocale: Locale): void => {
    applyDocumentLocale(nextLocale);
    persistLocale(nextLocale);
  }, []);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

