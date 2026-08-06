import type { SliderProps } from "./types";

export function Slider({
  className = "",
  id,
  label,
  valueText,
  ...props
}: SliderProps): React.ReactNode {
  const sliderId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <span className="flex items-center justify-between gap-4">
        <span className="font-medium">{label}</span>
        {valueText ? (
          <span className="font-[family-name:var(--font-commit-mono)] text-xs text-zinc-500 dark:text-zinc-400">
            {valueText}
          </span>
        ) : null}
      </span>
      <input
        aria-valuetext={valueText}
        className={`h-2 w-full cursor-pointer accent-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:accent-zinc-50 ${className}`}
        id={sliderId}
        type="range"
        {...props}
      />
    </label>
  );
}

