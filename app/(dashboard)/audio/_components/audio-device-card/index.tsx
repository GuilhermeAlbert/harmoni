"use client";

import { useState } from "react";
import { Headphones, Mic2, Volume2, VolumeX } from "lucide-react";

import type { AudioDeviceCardProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { AudioControl } from "@/lib/enums/audio-control";
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
  onSetDefault,
  onSetMute,
  onSetVolume,
  pending,
}: AudioDeviceCardProps): React.ReactNode {
  const [draftVolume, setDraftVolume] = useState(device.volume ?? 0);
  const busy = pending !== null;
  const defaultPending =
    pending?.deviceId === device.id && pending.control === AudioControl.Default;
  const mutePending =
    pending?.deviceId === device.id && pending.control === AudioControl.Mute;
  const volumePending =
    pending?.deviceId === device.id && pending.control === AudioControl.Volume;
  const statusLabel = device.isDefault ? messages.active : messages.available;
  const statusTone = device.isDefault ? BadgeTone.Success : BadgeTone.Neutral;
  const directionLabel =
    device.direction === AudioDirection.Input
      ? messages.defaultInput
      : messages.defaultOutput;
  const DeviceIcon =
    device.direction === AudioDirection.Input ? Mic2 : Headphones;
  const MuteIcon = device.muted === true ? VolumeX : Volume2;
  const commitVolume = (): void => {
    if (
      !busy &&
      device.canSetVolume &&
      draftVolume !== device.volume
    ) {
      void onSetVolume(device, draftVolume);
    }
  };

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

        {!device.isDefault ? (
          <div className="mt-4">
            <Button
              aria-busy={defaultPending}
              disabled={busy || !device.canSetDefault}
              onClick={() => void onSetDefault(device)}
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
            >
              {defaultPending ? messages.settingDefault : messages.makeDefault}
            </Button>
            {!device.canSetDefault ? (
              <p className="mt-2 text-xs text-zinc-500">
                {messages.unsupportedDefault}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]">
            <label className="flex justify-between gap-3 text-xs text-zinc-500" htmlFor={`audio-volume-${device.id}`}>
              {messages.volume}
              <span className="font-[family-name:var(--font-commit-mono)] font-medium text-zinc-700 dark:text-zinc-300">
                {device.canReadVolume && device.volume !== null
                  ? `${draftVolume}%`
                  : messages.unavailableReading}
              </span>
            </label>
            <input
              aria-busy={volumePending}
              className="mt-3 h-2 w-full cursor-pointer accent-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:accent-zinc-50"
              disabled={busy || !device.canSetVolume}
              id={`audio-volume-${device.id}`}
              max={100}
              min={0}
              onBlur={commitVolume}
              onChange={(event) => setDraftVolume(event.currentTarget.valueAsNumber)}
              onKeyUp={(event) => {
                if (["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home", "PageDown", "PageUp"].includes(event.key)) {
                  commitVolume();
                }
              }}
              onPointerUp={commitVolume}
              type="range"
              value={draftVolume}
            />
            {!device.canSetVolume ? (
              <p className="mt-2 text-xs text-zinc-500">{messages.unsupportedVolume}</p>
            ) : null}
          </div>
          <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]">
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <MuteIcon aria-hidden="true" className="size-3.5" />
              {messages.muteStatus}
            </p>
            <Button
              aria-busy={mutePending}
              className="mt-3"
              disabled={busy || !device.canSetMute || device.muted === null}
              onClick={() => void onSetMute(device, !device.muted)}
              size={ButtonSize.Small}
              variant={ButtonVariant.Secondary}
            >
              {mutePending
                ? messages.saving
                : device.muted
                  ? messages.unmute
                  : messages.mute}
            </Button>
            {!device.canSetMute ? (
              <p className="mt-2 text-xs text-zinc-500">{messages.unsupportedMute}</p>
            ) : null}
          </div>
        </div>
      </article>
    </li>
  );
}
