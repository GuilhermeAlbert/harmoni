import { Headphones, Mic2, Volume2, VolumeX } from "lucide-react";

import type { AudioDeviceCardProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { Slider } from "@/components/slider";
import { AudioDeviceStatus } from "@/lib/enums/audio-device-status";
import { AudioDirection } from "@/lib/enums/audio-direction";
import { AudioTransport } from "@/lib/enums/audio-transport";

const TRANSPORT_MESSAGE_KEYS: Record<
  AudioTransport,
  keyof AudioDeviceCardProps["messages"]["transports"]
> = {
  [AudioTransport.BuiltIn]: "builtIn",
  [AudioTransport.Bluetooth]: "bluetooth",
  [AudioTransport.Hdmi]: "hdmi",
  [AudioTransport.Usb]: "usb",
  [AudioTransport.UsbC]: "usbC",
};

export function AudioDeviceCard({
  device,
  messages,
  onMakeDefault,
  onToggleMute,
  onVolumeChange,
}: AudioDeviceCardProps): React.ReactNode {
  const available = device.status === AudioDeviceStatus.Available;
  const statusLabel =
    device.status === AudioDeviceStatus.Unsupported
      ? messages.unsupported
      : device.status === AudioDeviceStatus.Unavailable
        ? messages.unavailable
        : device.default
          ? messages.active
          : messages.available;
  const statusTone =
    device.status === AudioDeviceStatus.Unsupported
      ? BadgeTone.Warning
      : device.status === AudioDeviceStatus.Unavailable
        ? BadgeTone.Danger
        : device.default
          ? BadgeTone.Success
          : BadgeTone.Neutral;
  const directionLabel =
    device.direction === AudioDirection.Input
      ? messages.defaultInput
      : messages.defaultOutput;
  const DeviceIcon =
    device.direction === AudioDirection.Input ? Mic2 : Headphones;
  const MuteIcon = device.muted ? Volume2 : VolumeX;

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
                {device.default ? ` · ${directionLabel}` : ""}
              </p>
            </div>
          </div>
          <Badge className="self-start" tone={statusTone}>
            {statusLabel}
          </Badge>
        </div>

        <div className="mt-6">
          <Slider
            disabled={!available}
            label={messages.volume}
            max={100}
            min={0}
            name={`${device.id}-volume`}
            onChange={(event) =>
              onVolumeChange(device.id, Number(event.target.value))
            }
            step={1}
            value={device.volume}
            valueText={`${device.volume}%`}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            disabled={!available}
            onClick={() => onToggleMute(device.id)}
            size={ButtonSize.Small}
            variant={device.muted ? ButtonVariant.Primary : ButtonVariant.Secondary}
          >
            <MuteIcon aria-hidden="true" className="size-4" />
            {device.muted ? messages.unmute : messages.mute}
          </Button>
          <Button
            disabled={!available || device.default}
            onClick={() => onMakeDefault(device.id)}
            size={ButtonSize.Small}
            variant={ButtonVariant.Ghost}
          >
            {device.default ? directionLabel : messages.makeDefault}
          </Button>
          {device.muted ? (
            <span className="inline-flex min-h-9 items-center text-xs font-medium text-zinc-500">
              {messages.muted}
            </span>
          ) : null}
        </div>
      </article>
    </li>
  );
}
