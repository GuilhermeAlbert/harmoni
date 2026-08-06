"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useLanguage } from "@/contexts/language/use-language";
import { useTheme } from "@/contexts/theme/use-theme";
import { Theme } from "@/lib/enums/theme";

const THEME_OPTIONS = [
  { icon: Sun, messageKey: "light", value: Theme.Light },
  { icon: Moon, messageKey: "dark", value: Theme.Dark },
  { icon: Monitor, messageKey: "system", value: Theme.System },
] as const;

export function ThemeSelector(): React.ReactNode {
  const { messages } = useLanguage();
  const { setTheme, theme } = useTheme();

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {messages.theme.label}
      </legend>
      <div className="inline-flex rounded-xl border border-zinc-300 bg-zinc-100 p-1 dark:border-white/10 dark:bg-black/20">
        {THEME_OPTIONS.map(({ icon: Icon, messageKey, value }) => {
          const selected = theme === value;
          const label = messages.theme[messageKey];

          return (
            <button
              aria-pressed={selected}
              className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-white ${selected ? "bg-white text-zinc-950 shadow-sm dark:bg-white/10 dark:text-white" : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"}`}
              key={value}
              onClick={() => setTheme(value)}
              type="button"
            >
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
