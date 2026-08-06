import type { ComponentPropsWithRef } from "react";

import type { ButtonSize, ButtonVariant } from "./enums";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}
