import {
  Gamepad2,
  Keyboard,
  Mouse,
  PanelsTopLeft,
  Usb,
  type LucideIcon,
} from "lucide-react";

import type { PeripheralRowProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Switch } from "@/components/switch";
import { PeripheralCategory } from "@/lib/enums/peripheral-category";
import { PeripheralConnection } from "@/lib/enums/peripheral-connection";
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
  [PeripheralTransport.Usb]: "usb",
  [PeripheralTransport.UsbC]: "usbC",
  [PeripheralTransport.Wireless]: "wireless",
};

export function PeripheralRow({
  messages,
  onToggle,
  peripheral,
}: PeripheralRowProps): React.ReactNode {
  const connected =
    peripheral.connection === PeripheralConnection.Connected;
  const controllable = connected && peripheral.canDisable;
  const Icon = PERIPHERAL_ICONS[peripheral.category];
  const reasonId = `${peripheral.id}-control-reason`;
  const reason = !connected
    ? messages.disconnectedReason
    : !peripheral.canDisable
      ? messages.unsupported
      : null;

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
              {peripheral.manufacturer}
              {" · "}
              {messages.transports[TRANSPORT_MESSAGE_KEYS[peripheral.transport]]}
              {peripheral.batteryPercent === undefined
                ? ""
                : ` · ${peripheral.batteryPercent}% ${messages.battery}`}
            </p>
            {reason ? (
              <p
                className="mt-2 max-w-xl text-xs leading-5 text-amber-800 dark:text-amber-200"
                id={reasonId}
              >
                {reason}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
          <Badge tone={connected ? BadgeTone.Success : BadgeTone.Danger}>
            {connected ? messages.connected : messages.disconnected}
          </Badge>
          <Badge tone={peripheral.enabled ? BadgeTone.Neutral : BadgeTone.Warning}>
            {peripheral.enabled ? messages.enabled : messages.disabled}
          </Badge>
          <Switch
            accessibleName={`${peripheral.enabled ? messages.disable : messages.enable}: ${peripheral.name}`}
            aria-describedby={reason ? reasonId : undefined}
            checked={peripheral.enabled}
            disabled={!controllable}
            onCheckedChange={(enabled) => onToggle(peripheral.id, enabled)}
          />
        </div>
      </article>
    </li>
  );
}
