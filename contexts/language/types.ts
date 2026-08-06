import type { Locale } from "@/lib/enums/locale";
import type { Messages } from "@/lib/types/messages";

export interface LanguageContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}

