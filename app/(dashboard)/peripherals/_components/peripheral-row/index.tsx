import {
  Gamepad2,
  Keyboard,
  Mouse,
  PanelsTopLeft,
  Usb,
  type LucideIcon,
} from "lucide-react";

import type { PeripheralRowProps } from "./types";
import { PeripheralCategory } from "@/lib/enums/peripheral-category";
import { PeripheralTransport } from "@/lib/enums/peripheral-transport";

const PERIPHERAL_ICONS: Record<PeripheralCategory, LucideIcon> = {
  [PeripheralCategory.GameController]: Gamepad2,
  [PeripheralCategory.Keyboard]: Keyboard,
  [PeripheralCategory.Mouse]: Mouse,
  [PeripheralCategory.Other]: Usb,
  [PeripheralCategory.Trackpad]: PanelsTopLeft,
};

const CATEGORY_MESSAGE_KEYS: Record<
  PeripheralCategory,
  keyof PeripheralRowProps["messages"]["categories"]
> = {
  [PeripheralCategory.GameController]: "gameController",
  [PeripheralCategory.Keyboard]: "keyboard",
  [PeripheralCategory.Mouse]: "mouse",
  [PeripheralCategory.Other]: "other",
  [PeripheralCategory.Trackpad]: "trackpad",
};

const TRANSPORT_MESSAGE_KEYS: Record<
  PeripheralTransport,
  keyof PeripheralRowProps["messages"]["transports"]
> = {
  [PeripheralTransport.Bluetooth]: "bluetooth",
  [PeripheralTransport.BuiltIn]: "builtIn",
  [PeripheralTransport.Unknown]: "unknown",
  [PeripheralTransport.Usb]: "usb",
  [PeripheralTransport.Wireless]: "wireless",
};

export function PeripheralRow({
  messages,
  peripheral,
}: PeripheralRowProps): React.ReactNode {
  const Icon = PERIPHERAL_ICONS[peripheral.category];
  const batteryPercent = peripheral.batteryPercent;
  const hasBattery = batteryPercent !== undefined && Number.isInteger(batteryPercent) && batteryPercent >= 0 && batteryPercent <= 100;

  return (
    <li className="px-4 py-4 sm:px-5">
      <article className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{peripheral.name}</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {messages.categories[CATEGORY_MESSAGE_KEYS[peripheral.category]]}
              {" · "}
            {peripheral.manufacturer || messages.unavailableMetadata}
              {" · "}
              {messages.transports[TRANSPORT_MESSAGE_KEYS[peripheral.transport]]}
            {!hasBattery
                ? ""
                : ` · ${messages.batteryLevel}: ${batteryPercent}%`}
            </p>
          </div>
        </div>
      </article>
    </li>
  );
}
