import { ChevronDown } from "lucide-react";

import type { DevicePickerProps } from "./types";

export function DevicePicker({
  disabled = false,
  label,
  onChange,
  options,
  placeholder,
  value,
}: DevicePickerProps): React.ReactNode {
  return (
    <div className="relative">
      <select
        aria-label={label}
        className="min-h-12 w-full appearance-none truncate rounded-xl border border-zinc-300 bg-zinc-50 py-3 pl-3.5 pr-10 font-[family-name:var(--font-geist)] text-sm font-semibold text-zinc-950 outline-none transition hover:border-zinc-400 focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950/20 disabled:cursor-not-allowed disabled:opacity-55 dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-zinc-50 dark:hover:border-white/25 dark:focus-visible:border-white dark:focus-visible:ring-white/20"
        disabled={disabled || options.length === 0}
        onChange={(event) => onChange(event.target.value)}
        title={options.find((option) => option.value === value)?.label ?? placeholder}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
      />
    </div>
  );
}
