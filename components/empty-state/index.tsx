import type { EmptyStateProps } from "./types";

export function EmptyState({
  action,
  description,
  icon: Icon,
  title,
}: EmptyStateProps): React.ReactNode {
  return (
    <div className="grid justify-items-center px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/5 dark:text-zinc-400">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h3 className="mt-4 font-[family-name:var(--font-geist)] text-base font-semibold text-zinc-950 dark:text-zinc-50">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

