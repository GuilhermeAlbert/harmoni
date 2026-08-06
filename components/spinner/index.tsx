import { LoaderCircle } from "lucide-react";

import { SPINNER_SIZE_CLASSES } from "./constants";
import { SpinnerSize } from "./enums";
import type { SpinnerProps } from "./types";

export function Spinner({
  label,
  size = SpinnerSize.Medium,
}: SpinnerProps): React.ReactNode {
  return (
    <span className="inline-flex items-center justify-center" role="status">
      <LoaderCircle
        aria-hidden="true"
        className={`animate-spin motion-reduce:animate-none ${SPINNER_SIZE_CLASSES[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

