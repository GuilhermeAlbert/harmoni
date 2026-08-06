import { IconButtonVariant } from "./enums";

export const ICON_BUTTON_VARIANT_CLASSES: Record<
  IconButtonVariant,
  string
> = {
  [IconButtonVariant.Secondary]:
    "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10 dark:active:bg-white/15",
  [IconButtonVariant.Ghost]:
    "text-zinc-600 hover:bg-zinc-200 active:bg-zinc-300 dark:text-zinc-400 dark:hover:bg-white/10 dark:active:bg-white/15",
};

