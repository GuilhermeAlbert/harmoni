import type { MetricCardProps } from "./types";
import { Panel } from "@/components/panel";

export function MetricCard({
  description,
  icon: Icon,
  title,
  value,
}: MetricCardProps): React.ReactNode {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        <Icon aria-hidden="true" className="size-3.5" />
        <h3>{title}</h3>
      </div>
      <p className="mt-5 truncate font-[family-name:var(--font-geist)] text-base font-semibold text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </Panel>
  );
}
