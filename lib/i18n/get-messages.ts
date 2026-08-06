import { Locale } from "@/lib/enums/locale";
import { EN_MESSAGES } from "@/lib/i18n/messages/en";
import { ES_MESSAGES } from "@/lib/i18n/messages/es";
import { PT_BR_MESSAGES } from "@/lib/i18n/messages/pt-br";
import type { Messages } from "@/lib/types/messages";

const MESSAGES_BY_LOCALE: Record<Locale, Messages> = {
  [Locale.English]: EN_MESSAGES,
  [Locale.PortugueseBrazil]: PT_BR_MESSAGES,
  [Locale.Spanish]: ES_MESSAGES,
};

export function getMessages(locale: Locale): Messages {
  return MESSAGES_BY_LOCALE[locale];
}

export function isLocale(value: string | null): value is Locale {
  return Object.values(Locale).some((locale) => locale === value);
}

