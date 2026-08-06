import { ButtonSize, ButtonVariant } from "./enums";
import {
  BUTTON_SIZE_CLASSES,
  BUTTON_VARIANT_CLASSES,
} from "./constants";
import type { ButtonProps } from "./types";
import { Spinner } from "@/components/spinner";
import { SpinnerSize } from "@/components/spinner/enums";

export function Button(buttonProps: ButtonProps): React.ReactNode {
  const {
    children,
    className = "",
    disabled,
    loading = false,
    loadingLabel,
    size = ButtonSize.Medium,
    type = "button",
    variant = ButtonVariant.Primary,
    ...props
  } = buttonProps;

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-white ${BUTTON_SIZE_CLASSES[size]} ${BUTTON_VARIANT_CLASSES[variant]} ${className}`}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && loadingLabel ? (
        <Spinner label={loadingLabel} size={SpinnerSize.Small} />
      ) : null}
      {children}
    </button>
  );
}
