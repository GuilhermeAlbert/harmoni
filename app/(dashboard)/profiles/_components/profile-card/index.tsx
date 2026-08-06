import { Camera, Mic2, Volume2 } from "lucide-react";

import type { ProfileCardProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { Panel } from "@/components/panel";
import { useAudioDevices } from "@/contexts/audio-devices/use-audio-devices";
import { CAMERA_FIXTURES } from "@/lib/constants/camera-fixtures";
import { ProfileOrigin } from "@/lib/enums/profile-origin";

export function ProfileCard({
  messages,
  onApply,
  onEdit,
  profile,
}: ProfileCardProps): React.ReactNode {
  const { devices: audioDevices } = useAudioDevices();
  const presetMessages = profile.preset
    ? messages.presets[profile.preset]
    : null;
  const name = presetMessages?.name ?? profile.name;
  const description = presetMessages?.description ?? profile.description;
  const inputName =
    audioDevices.find(
      (device) => device.id === profile.preferences.audioInputId,
    )?.name ?? profile.preferences.audioInputId;
  const outputName =
    audioDevices.find(
      (device) => device.id === profile.preferences.audioOutputId,
    )?.name ?? profile.preferences.audioOutputId;
  const cameraName =
    CAMERA_FIXTURES.find(
      (camera) => camera.id === profile.preferences.cameraId,
    )?.name ?? profile.preferences.cameraId;

  return (
    <Panel className={`flex h-full flex-col p-5 ${profile.active ? "ring-1 ring-zinc-950 dark:ring-zinc-50" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
          {profile.active ? messages.active : messages.profile}
        </p>
        <div className="flex flex-wrap gap-2">
          {profile.origin === ProfileOrigin.Session ? (
            <Badge>{messages.sessionProfile}</Badge>
          ) : null}
          {profile.active ? (
            <Badge tone={BadgeTone.Success}>{messages.active}</Badge>
          ) : null}
        </div>
      </div>

      <h2 className="mt-5 font-[family-name:var(--font-geist)] text-xl font-semibold">
        {name}
      </h2>
      <p className="mt-2 min-h-10 text-sm leading-5 text-zinc-500">
        {description}
      </p>

      <dl className="mt-5 grid gap-3 border-y border-zinc-200 py-4 text-xs dark:border-white/[0.08]">
        <div className="flex items-center justify-between gap-4">
          <dt className="inline-flex items-center gap-2 text-zinc-500">
            <Mic2 aria-hidden="true" className="size-3.5" />
            {messages.preferences.audioInput}
          </dt>
          <dd className="truncate font-medium">{inputName}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="inline-flex items-center gap-2 text-zinc-500">
            <Volume2 aria-hidden="true" className="size-3.5" />
            {messages.preferences.audioOutput}
          </dt>
          <dd className="truncate font-medium">{outputName}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="inline-flex items-center gap-2 text-zinc-500">
            <Camera aria-hidden="true" className="size-3.5" />
            {messages.preferences.camera}
          </dt>
          <dd className="truncate font-medium">{cameraName}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
        <span>{messages.preferences.inputVolume}: {profile.preferences.inputVolume}%</span>
        <span aria-hidden="true">·</span>
        <span>
          {profile.preferences.microphonesMuted
            ? messages.preferences.microphonesMuted
            : messages.preferences.microphonesLive}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {profile.preferences.cameraEnabled
            ? messages.preferences.cameraEnabled
            : messages.preferences.cameraDisabled}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button
          disabled={profile.active}
          onClick={() => onApply(profile.id)}
          size={ButtonSize.Small}
        >
          {profile.active ? messages.active : messages.apply}
        </Button>
        <Button
          onClick={() => onEdit(profile.id)}
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          {messages.edit}
        </Button>
      </div>
    </Panel>
  );
}
