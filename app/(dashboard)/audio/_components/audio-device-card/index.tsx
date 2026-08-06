import { Headphones, Mic2, Volume2, VolumeX } from "lucide-react";

import type { AudioDeviceCardProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { AudioDirection } from "@/lib/enums/audio-direction";
import { AudioTransport } from "@/lib/enums/audio-transport";

const TRANSPORT_MESSAGE_KEYS: Record<
  AudioTransport,
  keyof AudioDeviceCardProps["messages"]["transports"]
> = {
  [AudioTransport.BuiltIn]: "builtIn",
  [AudioTransport.Airplay]: "airplay",
  [AudioTransport.Bluetooth]: "bluetooth",
  [AudioTransport.Hdmi]: "hdmi",
  [AudioTransport.Usb]: "usb",
  [AudioTransport.Unknown]: "unknown",
  [AudioTransport.Virtual]: "virtual",
};

export function AudioDeviceCard({
  device,
  messages,
}: AudioDeviceCardProps): React.ReactNode {
  const statusLabel = device.isDefault ? messages.active : messages.available;
  const statusTone = device.isDefault ? BadgeTone.Success : BadgeTone.Neutral;
  const directionLabel =
    device.direction === AudioDirection.Input
      ? messages.defaultInput
      : messages.defaultOutput;
  const DeviceIcon =
    device.direction === AudioDirection.Input ? Mic2 : Headphones;
  const MuteIcon = device.muted === true ? VolumeX : Volume2;

  return (
    <li className="p-4 sm:p-5">
      <article>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
              <DeviceIcon aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{device.name}</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {messages.transports[TRANSPORT_MESSAGE_KEYS[device.transport]]}
                {device.isDefault ? ` · ${directionLabel}` : ""}
              </p>
            </div>
          </div>
          <Badge className="self-start" tone={statusTone}>
            {statusLabel}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]">
            <dt className="text-xs text-zinc-500">{messages.volume}</dt>
            <dd className="mt-1 font-[family-name:var(--font-commit-mono)] font-medium">
              {device.canReadVolume && device.volume !== null
                ? `${device.volume}%`
                : messages.unavailableReading}
            </dd>
          </div>
          <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]">
            <dt className="flex items-center gap-1.5 text-xs text-zinc-500">
              <MuteIcon aria-hidden="true" className="size-3.5" />
              {messages.muteStatus}
            </dt>
            <dd className="mt-1 font-medium">
              {device.canReadMute && device.muted !== null
                ? device.muted
                  ? messages.muted
                  : messages.unmuted
                : messages.unavailableReading}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-zinc-500">{messages.readOnly}</p>
      </article>
    </li>
  );
}
