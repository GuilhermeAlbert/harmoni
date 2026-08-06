import type { ButtonSize, ButtonVariant } from "./enums";
import { ButtonSize as Size, ButtonVariant as Variant } from "./enums";

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  [Size.Small]: "min-h-9 px-3 text-xs",
  [Size.Medium]: "min-h-11 px-4 text-sm",
};

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  [Variant.Primary]:
    "bg-zinc-950 text-white hover:bg-zinc-800 active:bg-black dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:active:bg-white",
  [Variant.Secondary]:
    "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10 dark:active:bg-white/15",
  [Variant.Destructive]:
    "bg-red-700 text-white hover:bg-red-800 active:bg-red-900 dark:bg-red-500 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-600",
  [Variant.Ghost]:
    "text-zinc-700 hover:bg-zinc-200 active:bg-zinc-300 dark:text-zinc-300 dark:hover:bg-white/10 dark:active:bg-white/15",
};

