"use client";

import type { ChangeEvent } from "react";
import { AlertTriangle, Unplug } from "lucide-react";

import { useState } from "react";

import { AudioDeviceSection } from "../audio-device-section";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { useLanguage } from "@/contexts/language/use-language";
import { AUDIO_DEVICE_FIXTURES } from "@/lib/constants/audio-device-fixtures";
import { AudioDirection } from "@/lib/enums/audio-direction";
import { AudioFixtureState } from "@/lib/enums/audio-fixture-state";
import type { AudioDevice } from "@/lib/types/audio-device";

const AUDIO_FIXTURE_STATES = [
  AudioFixtureState.Success,
  AudioFixtureState.Loading,
  AudioFixtureState.Empty,
  AudioFixtureState.Error,
] as const;

function copyAudioFixtures(): AudioDevice[] {
  return AUDIO_DEVICE_FIXTURES.map(
    (device): AudioDevice => ({ ...device }),
  );
}

function isAudioFixtureState(value: string): value is AudioFixtureState {
  return AUDIO_FIXTURE_STATES.some((state) => state === value);
}

export function AudioScreen(): React.ReactNode {
  const [devices, setDevices] = useState<AudioDevice[]>(copyAudioFixtures);
  const [feedback, setFeedback] = useState("");
  const [fixtureState, setFixtureState] = useState(AudioFixtureState.Success);
  const { messages } = useLanguage();
  const audioMessages = messages.audio;
  const inputs = devices.filter(
    (device) => device.direction === AudioDirection.Input,
  );
  const outputs = devices.filter(
    (device) => device.direction === AudioDirection.Output,
  );

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (isAudioFixtureState(event.target.value)) {
      setFixtureState(event.target.value);
      setFeedback("");
    }
  };

  const handleVolumeChange = (deviceId: string, volume: number): void => {
    const safeVolume = Math.min(100, Math.max(0, volume));

    setDevices((currentDevices) =>
      currentDevices.map((device) =>
        device.id === deviceId ? { ...device, volume: safeVolume } : device,
      ),
    );
    setFeedback(audioMessages.feedback.volumeChanged);
  };

  const handleToggleMute = (deviceId: string): void => {
    const selectedDevice = devices.find((device) => device.id === deviceId);

    if (!selectedDevice) {
      return;
    }

    const muted = !selectedDevice.muted;

    setDevices((currentDevices) =>
      currentDevices.map((device) =>
        device.id === deviceId ? { ...device, muted } : device,
      ),
    );
    setFeedback(
      muted
        ? audioMessages.feedback.muted
        : audioMessages.feedback.unmuted,
    );
  };

  const handleMakeDefault = (deviceId: string): void => {
    const selectedDevice = devices.find((device) => device.id === deviceId);

    if (!selectedDevice) {
      return;
    }

    setDevices((currentDevices) =>
      currentDevices.map((device) =>
        device.direction === selectedDevice.direction
          ? { ...device, default: device.id === deviceId }
          : device,
      ),
    );
    setFeedback(audioMessages.feedback.defaultChanged);
  };

  const restoreSuccessState = (): void => {
    setDevices(copyAudioFixtures());
    setFixtureState(AudioFixtureState.Success);
    setFeedback("");
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Warning}>{audioMessages.fixtureLabel}</Badge>
            <p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {audioMessages.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-geist)] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-4xl">
              {audioMessages.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {audioMessages.description}
            </p>
          </div>

          <label className="grid min-w-52 gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {audioMessages.stateLabel}
            <select
              className="min-h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:outline-white"
              onChange={handleStateChange}
              value={fixtureState}
            >
              {AUDIO_FIXTURE_STATES.map((state) => (
                <option key={state} value={state}>
                  {audioMessages.states[state]}
                </option>
              ))}
            </select>
            <span className="font-normal text-zinc-500">
              {audioMessages.stateHint}
            </span>
          </label>
        </div>

        <p
          aria-live="polite"
          className="mt-5 min-h-5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          role="status"
        >
          {feedback}
        </p>

        {fixtureState === AudioFixtureState.Loading ? (
          <Panel className="mt-4 grid min-h-80 place-items-center p-8">
            <div className="grid justify-items-center gap-3 text-sm text-zinc-500">
              <Spinner label={audioMessages.loading} />
              <span>{audioMessages.loading}</span>
            </div>
          </Panel>
        ) : null}

        {fixtureState === AudioFixtureState.Empty ? (
          <Panel aria-live="polite" className="mt-4">
            <EmptyState
              description={audioMessages.emptyDescription}
              icon={Unplug}
              title={audioMessages.emptyTitle}
            />
          </Panel>
        ) : null}

        {fixtureState === AudioFixtureState.Error ? (
          <Panel className="mt-4" role="alert">
            <EmptyState
              action={
                <Button
                  onClick={restoreSuccessState}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                >
                  {audioMessages.retry}
                </Button>
              }
              description={audioMessages.errorDescription}
              icon={AlertTriangle}
              title={audioMessages.errorTitle}
            />
          </Panel>
        ) : null}

        {fixtureState === AudioFixtureState.Success ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <AudioDeviceSection
              description={audioMessages.inputsDescription}
              devices={inputs}
              messages={audioMessages}
              onMakeDefault={handleMakeDefault}
              onToggleMute={handleToggleMute}
              onVolumeChange={handleVolumeChange}
              title={audioMessages.inputsTitle}
            />
            <AudioDeviceSection
              description={audioMessages.outputsDescription}
              devices={outputs}
              messages={audioMessages}
              onMakeDefault={handleMakeDefault}
              onToggleMute={handleToggleMute}
              onVolumeChange={handleVolumeChange}
              title={audioMessages.outputsTitle}
            />
          </div>
        ) : null}

      </div>
    </main>
  );
}
