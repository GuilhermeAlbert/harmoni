import type { ComponentPropsWithRef } from "react";
import type { LucideIcon } from "lucide-react";

import type { IconButtonVariant } from "./enums";

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  accessibleName: string;
  icon: LucideIcon;
  variant?: IconButtonVariant;
}
