import { ICON_BUTTON_VARIANT_CLASSES } from "./constants";
import { IconButtonVariant } from "./enums";
import type { IconButtonProps } from "./types";

export function IconButton({
  accessibleName,
  className = "",
  icon: Icon,
  type = "button",
  variant = IconButtonVariant.Secondary,
  ...props
}: IconButtonProps): React.ReactNode {
  return (
    <button
      aria-label={accessibleName}
      className={`inline-grid size-11 place-items-center rounded-xl transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-white ${ICON_BUTTON_VARIANT_CLASSES[variant]} ${className}`}
      type={type}
      {...props}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}

