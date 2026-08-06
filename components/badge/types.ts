import type { ComponentPropsWithRef, PropsWithChildren } from "react";

import type { BadgeTone } from "./enums";

export interface BadgeProps
  extends PropsWithChildren<ComponentPropsWithRef<"span">> {
  tone?: BadgeTone;
}
