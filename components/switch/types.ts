import type { ComponentPropsWithRef } from "react";

export interface SwitchProps
  extends Omit<
    ComponentPropsWithRef<"button">,
    "aria-checked" | "children" | "onChange" | "role"
  > {
  accessibleName: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
