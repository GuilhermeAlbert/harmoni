"use client";

import { Camera, Headphones, Keyboard, Mic2, RefreshCw } from "lucide-react";

import { DeviceControlCard } from "./device-control-card";
import { MetricCard } from "./metric-card";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { useAudioDevices } from "@/contexts/audio-devices/use-audio-devices";
import { useCameras } from "@/contexts/cameras/use-cameras";
import { useLanguage } from "@/contexts/language/use-language";
import { usePeripherals } from "@/contexts/peripherals/use-peripherals";
import { AudioControl } from "@/lib/enums/audio-control";
import { AudioDirection } from "@/lib/enums/audio-direction";
import { AudioDiscoveryState } from "@/lib/enums/audio-discovery-state";
import { AudioMutationStatus } from "@/lib/enums/audio-mutation-status";
import { AudioTransport } from "@/lib/enums/audio-transport";
import { CameraAction } from "@/lib/enums/camera-action";
import { CameraDiscoveryState } from "@/lib/enums/camera-discovery-state";
import { CameraMutationStatus } from "@/lib/enums/camera-mutation-status";
import { CameraTransport } from "@/lib/enums/camera-transport";
import { InputMonitoringStatus } from "@/lib/enums/input-monitoring-status";
import { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";

const AUDIO_TRANSPORT_KEYS = {
  [AudioTransport.Airplay]: "airplay",
  [AudioTransport.BuiltIn]: "builtIn",
  [AudioTransport.Bluetooth]: "bluetooth",
  [AudioTransport.Hdmi]: "hdmi",
  [AudioTransport.Usb]: "usb",
  [AudioTransport.Unknown]: "unknown",
  [AudioTransport.Virtual]: "virtual",
} as const;

const CAMERA_TRANSPORT_KEYS = {
  [CameraTransport.BuiltIn]: "builtIn",
  [CameraTransport.Continuity]: "continuity",
  [CameraTransport.External]: "external",
  [CameraTransport.Unknown]: "unknown",
} as const;

export function Overview(): React.ReactNode {
  const audio = useAudioDevices();
  const cameras = useCameras();
  const peripherals = usePeripherals();
  const { messages } = useLanguage();
  const overviewMessages = messages.overview;
  const inputs = audio.devices.filter((device) => device.direction === AudioDirection.Input);
  const outputs = audio.devices.filter((device) => device.direction === AudioDirection.Output);
  const input = inputs.find((device) => device.isDefault) ?? inputs[0];
  const output = outputs.find((device) => device.isDefault) ?? outputs[0];
  const camera = cameras.cameras.find((device) => device.preferred) ?? cameras.cameras[0];
  const audioPendingDevice = audio.devices.find((device) => device.id === audio.pending?.deviceId);
  const inputPending = audio.pending?.control === AudioControl.Default && audioPendingDevice?.direction === AudioDirection.Input;
  const outputPending = audio.pending?.control === AudioControl.Default && audioPendingDevice?.direction === AudioDirection.Output;
  const cameraPending = cameras.pending?.action === CameraAction.Preference;
  const degraded =
    audio.state === AudioDiscoveryState.Degraded ||
    audio.state === AudioDiscoveryState.Error ||
    cameras.state === CameraDiscoveryState.Degraded ||
    cameras.state === CameraDiscoveryState.Error ||
    peripherals.state === PeripheralDiscoveryState.Degraded ||
    peripherals.state === PeripheralDiscoveryState.Error;
  const refreshing = audio.refreshing || cameras.refreshing || peripherals.refreshing;

  const audioFeedback = (direction: AudioDirection): string => {
    const mutationDevice = audio.devices.find((device) => device.id === audio.mutation?.deviceId);
    if (audio.pending?.control === AudioControl.Default && audioPendingDevice?.direction === direction) {
      return overviewMessages.pickers.applying;
    }
    if (audio.mutation?.control !== AudioControl.Default || mutationDevice?.direction !== direction) return "";
    return audio.mutation.status === AudioMutationStatus.Error
      ? audio.mutation.message ?? overviewMessages.pickers.failed
      : overviewMessages.pickers.applied;
  };

  const cameraFeedback = cameraPending
    ? overviewMessages.pickers.savingPreference
    : cameras.mutation?.action === CameraAction.Preference
      ? cameras.mutation.status === CameraMutationStatus.Error
        ? cameras.mutation.message ?? overviewMessages.pickers.failed
        : overviewMessages.pickers.preferenceSaved
      : "";

  const refresh = (): void => {
    audio.refresh();
    cameras.refresh();
    peripherals.refresh();
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Success}>{overviewMessages.liveDataLabel}</Badge>
            <p className="mt-4 text-xs uppercase tracking-wider text-zinc-500">{overviewMessages.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">{overviewMessages.title}</h2>
            <p className="mt-4 text-sm text-zinc-500">{overviewMessages.description}</p>
          </div>
          {degraded ? (
            <Button disabled={refreshing} onClick={refresh} size={ButtonSize.Small} variant={ButtonVariant.Secondary}>
              <RefreshCw aria-hidden="true" className={`size-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`} />
              {refreshing ? overviewMessages.refreshing : overviewMessages.recover}
            </Button>
          ) : null}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <DeviceControlCard
            disabled={inputPending}
            feedback={audioFeedback(AudioDirection.Input)}
            hint={input ? messages.audio.transports[AUDIO_TRANSPORT_KEYS[input.transport]] : overviewMessages.metrics.noActiveDevice}
            icon={Mic2}
            label={overviewMessages.metrics.audioInput}
            onChange={(id) => {
              const device = inputs.find((candidate) => candidate.id === id);
              if (device) void audio.setDefault(device);
            }}
            options={inputs.map((device) => ({ label: device.name, value: device.id }))}
            placeholder={inputs.length ? overviewMessages.pickers.chooseInput : overviewMessages.pickers.noInput}
            value={inputs.find((device) => device.isDefault)?.id ?? ""}
          />
          <DeviceControlCard
            disabled={outputPending}
            feedback={audioFeedback(AudioDirection.Output)}
            hint={output ? messages.audio.transports[AUDIO_TRANSPORT_KEYS[output.transport]] : overviewMessages.metrics.noActiveDevice}
            icon={Headphones}
            label={overviewMessages.metrics.audioOutput}
            onChange={(id) => {
              const device = outputs.find((candidate) => candidate.id === id);
              if (device) void audio.setDefault(device);
            }}
            options={outputs.map((device) => ({ label: device.name, value: device.id }))}
            placeholder={outputs.length ? overviewMessages.pickers.chooseOutput : overviewMessages.pickers.noOutput}
            value={outputs.find((device) => device.isDefault)?.id ?? ""}
          />
          <DeviceControlCard
            disabled={cameraPending}
            feedback={cameraFeedback}
            hint={camera ? messages.cameras.transports[CAMERA_TRANSPORT_KEYS[camera.transport]] : overviewMessages.cameraPreferenceHint}
            icon={Camera}
            label={overviewMessages.metrics.camera}
            onChange={(id) => {
              const selectedCamera = cameras.cameras.find((candidate) => candidate.id === id);
              if (selectedCamera) void cameras.setPreferred(selectedCamera);
            }}
            options={cameras.cameras.map((device) => ({ label: device.name, value: device.id }))}
            placeholder={cameras.cameras.length ? overviewMessages.pickers.chooseCamera : overviewMessages.pickers.noCamera}
            value={cameras.cameras.some((candidate) => candidate.id === cameras.preferredCameraId) ? cameras.preferredCameraId ?? "" : ""}
          />
          <MetricCard
            description={peripherals.inputMonitoring === InputMonitoringStatus.Authorized ? overviewMessages.metrics.allResponding : messages.peripherals.inputMonitoringGuidance}
            icon={Keyboard}
            title={overviewMessages.metrics.peripherals}
            value={`${peripherals.peripherals.length} ${overviewMessages.metrics.connected}`}
          />
        </div>
      </div>
    </main>
  );
}
