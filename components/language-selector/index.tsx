"use client";

import type { ChangeEvent } from "react";

import { useLanguage } from "@/contexts/language/use-language";
import { Locale } from "@/lib/enums/locale";
import { isLocale } from "@/lib/i18n/get-messages";

const LANGUAGE_OPTIONS = [
  { label: "English", value: Locale.English },
  { label: "Português", value: Locale.PortugueseBrazil },
  { label: "Español", value: Locale.Spanish },
] as const;

export function LanguageSelector(): React.ReactNode {
  const { locale, messages, setLocale } = useLanguage();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (isLocale(event.target.value)) {
      setLocale(event.target.value);
    }
  };

  return (
    <label className="grid gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
      {messages.language.label}
      <select
        className="min-h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:outline-white"
        onChange={handleChange}
        value={locale}
      >
        {LANGUAGE_OPTIONS.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

