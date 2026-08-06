import { BadgeTone } from "./enums";

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  [BadgeTone.Neutral]:
    "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
  [BadgeTone.Success]:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
  [BadgeTone.Warning]:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
  [BadgeTone.Danger]:
    "border-red-300 bg-red-50 text-red-800 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200",
};

