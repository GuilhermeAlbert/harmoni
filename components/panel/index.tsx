import type { PanelProps } from "./types";

export function Panel({
  children,
  className = "",
  ...props
}: PanelProps): React.ReactNode {
  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.035] dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

