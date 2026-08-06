import { BADGE_TONE_CLASSES } from "./constants";
import { BadgeTone } from "./enums";
import type { BadgeProps } from "./types";

export function Badge({
  children,
  className = "",
  tone = BadgeTone.Neutral,
  ...props
}: BadgeProps): React.ReactNode {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold ${BADGE_TONE_CLASSES[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

