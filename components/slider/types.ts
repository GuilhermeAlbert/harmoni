import type { ComponentPropsWithRef } from "react";

export interface SliderProps
  extends Omit<ComponentPropsWithRef<"input">, "type"> {
  label: string;
  valueText?: string;
}
