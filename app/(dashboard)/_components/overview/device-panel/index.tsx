import Link from "next/link";
import {
  Camera,
  Headphones,
  Keyboard,
  Mic2,
  Mouse,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react";

import type { DevicePanelProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Panel } from "@/components/panel";
import { Switch } from "@/components/switch";
import { DashboardPath } from "@/lib/enums/dashboard-path";
import { DeviceAvailabilityStatus } from "@/lib/enums/device-availability-status";
import { DeviceCategory } from "@/lib/enums/device-category";
import { DeviceConnectionStatus } from "@/lib/enums/device-connection-status";

const DEVICE_ICONS: Record<DeviceCategory, LucideIcon> = {
  [DeviceCategory.AudioInput]: Mic2,
  [DeviceCategory.AudioOutput]: Headphones,
  [DeviceCategory.Camera]: Camera,
  [DeviceCategory.Keyboard]: Keyboard,
  [DeviceCategory.Mouse]: Mouse,
  [DeviceCategory.Trackpad]: PanelsTopLeft,
};

const CATEGORY_MESSAGE_KEYS: Record<
  DeviceCategory,
  keyof DevicePanelProps["messages"]["categories"]
> = {
  [DeviceCategory.AudioInput]: "audioInput",
  [DeviceCategory.AudioOutput]: "audioOutput",
  [DeviceCategory.Camera]: "camera",
  [DeviceCategory.Keyboard]: "keyboard",
  [DeviceCategory.Mouse]: "mouse",
  [DeviceCategory.Trackpad]: "trackpad",
};

export function DevicePanel({
  devices,
  messages,
  onToggleDevice,
}: DevicePanelProps): React.ReactNode {
  return (
    <Panel className="overflow-hidden">
      <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
        <div>
          <h2 className="text-sm font-semibold">{messages.title}</h2>
          <p className="mt-1 text-xs text-zinc-500">{messages.description}</p>
        </div>
        <Link
          className="inline-flex min-h-9 shrink-0 items-center rounded-xl border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:focus-visible:outline-white"
          href={DashboardPath.Peripherals}
        >
          {messages.viewAll}
        </Link>
      </header>
      <ul className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
        {devices.map((device) => {
          const Icon = DEVICE_ICONS[device.category];
          const category =
            messages.categories[CATEGORY_MESSAGE_KEYS[device.category]];
          const supported =
            device.availability === DeviceAvailabilityStatus.Available;
          const connected =
            device.connection === DeviceConnectionStatus.Connected;
          const status =
            device.availability === DeviceAvailabilityStatus.Unsupported
              ? messages.status.unsupported
              : device.availability === DeviceAvailabilityStatus.Unavailable
                ? messages.status.unavailable
                : !connected
                  ? messages.status.disconnected
                  : device.active
                    ? messages.status.active
                    : messages.status.connected;
          const statusTone =
            device.availability === DeviceAvailabilityStatus.Unsupported
              ? BadgeTone.Warning
              : !supported || !connected
                ? BadgeTone.Danger
                : device.active
                  ? BadgeTone.Success
                  : BadgeTone.Neutral;
          const details = [
            category,
            device.transport,
            device.batteryPercent === undefined
              ? null
              : `${device.batteryPercent}% ${messages.battery}`,
            device.cameraResolution,
          ].filter((detail): detail is string => Boolean(detail));

          return (
            <li
              className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
              key={device.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{device.name}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {details.join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge className="hidden sm:inline-flex" tone={statusTone}>
                  {status}
                </Badge>
                <Switch
                  accessibleName={`${device.enabled ? messages.disable : messages.enable}: ${device.name}`}
                  checked={device.enabled}
                  disabled={!supported || !connected}
                  onCheckedChange={(enabled) =>
                    onToggleDevice(device.id, enabled)
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
