import type { DeviceControlCardProps } from "./types";
import { DevicePicker } from "@/components/device-picker";
import { Panel } from "@/components/panel";

export function DeviceControlCard({
  disabled,
  feedback,
  hint,
  icon: Icon,
  label,
  onChange,
  options,
  placeholder,
  value,
}: DeviceControlCardProps): React.ReactNode {
  return (
    <Panel className="p-5">
      <div className="flex items-center gap-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        <Icon aria-hidden="true" className="size-3.5" />
        <h3>{label}</h3>
      </div>
      <div className="mt-4">
        <DevicePicker
          disabled={disabled}
          label={label}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          value={value}
        />
      </div>
      <p className="mt-2 min-h-4 truncate text-xs text-zinc-500 dark:text-zinc-400" title={feedback || hint}>
        {feedback || hint}
      </p>
    </Panel>
  );
}
