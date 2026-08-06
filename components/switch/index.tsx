"use client";

import type { SwitchProps } from "./types";

export function Switch({
  accessibleName,
  checked,
  className = "",
  disabled,
  onCheckedChange,
  type = "button",
  ...props
}: SwitchProps): React.ReactNode {
  return (
    <button
      aria-checked={checked}
      aria-label={accessibleName}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-white ${checked ? "bg-zinc-950 dark:bg-zinc-50" : "bg-zinc-300 dark:bg-zinc-700"} ${className}`}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      type={type}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`size-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none dark:bg-zinc-950 ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

