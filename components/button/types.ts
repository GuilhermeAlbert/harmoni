import type { ComponentPropsWithRef } from "react";

import type { ButtonSize, ButtonVariant } from "./enums";

interface ButtonBaseProps extends ComponentPropsWithRef<"button"> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

interface LoadingButtonProps extends ButtonBaseProps {
  loading: true;
  loadingLabel: string;
}

interface IdleButtonProps extends ButtonBaseProps {
  loading?: false;
  loadingLabel?: never;
}

export type ButtonProps = LoadingButtonProps | IdleButtonProps;
