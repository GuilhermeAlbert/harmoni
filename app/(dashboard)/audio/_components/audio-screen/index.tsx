"use client";

import { AlertTriangle, RefreshCw, Unplug } from "lucide-react";

import { AudioDeviceSection } from "../audio-device-section";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { useAudioDevices } from "@/contexts/audio-devices/use-audio-devices";
import { useLanguage } from "@/contexts/language/use-language";
import { AudioDirection } from "@/lib/enums/audio-direction";
import { AudioDiscoveryState } from "@/lib/enums/audio-discovery-state";
import { AudioControl } from "@/lib/enums/audio-control";
import { AudioMutationStatus } from "@/lib/enums/audio-mutation-status";

export function AudioScreen(): React.ReactNode {
  const {
    devices,
    mutation,
    pending,
    refresh,
    refreshing,
    setDefault,
    setMute,
    setVolume,
    state,
  } = useAudioDevices();
  const { messages } = useLanguage();
  const audioMessages = messages.audio;
  const inputs = devices.filter(
    (device) => device.direction === AudioDirection.Input,
  );
  const outputs = devices.filter(
    (device) => device.direction === AudioDirection.Output,
  );
  const mutationFeedback = mutation
    ? mutation.status === AudioMutationStatus.Error
      ? audioMessages.feedback.failure
      : {
          [AudioControl.Default]: audioMessages.feedback.defaultSuccess,
          [AudioControl.Mute]: audioMessages.feedback.muteSuccess,
          [AudioControl.Volume]: audioMessages.feedback.volumeSuccess,
        }[mutation.control]
    : "";

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Success}>{audioMessages.realDataLabel}</Badge>
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

          <Button
            disabled={refreshing || state === AudioDiscoveryState.Loading}
            onClick={refresh}
            variant={ButtonVariant.Secondary}
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
            />
            {refreshing ? audioMessages.refreshing : audioMessages.refresh}
          </Button>
        </div>

        <p
          aria-live="polite"
          className="mt-5 min-h-5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          role="status"
        >
          {pending
            ? audioMessages.feedback.saving
            : refreshing
              ? audioMessages.refreshing
              : mutationFeedback}
        </p>

        {state === AudioDiscoveryState.Loading ? (
          <Panel className="mt-4 grid min-h-80 place-items-center p-8">
            <div className="grid justify-items-center gap-3 text-sm text-zinc-500">
              <Spinner label={audioMessages.loading} />
              <span>{audioMessages.loading}</span>
            </div>
          </Panel>
        ) : null}

        {state === AudioDiscoveryState.Ready && devices.length === 0 ? (
          <Panel aria-live="polite" className="mt-4">
            <EmptyState
              description={audioMessages.emptyDescription}
              icon={Unplug}
              title={audioMessages.emptyTitle}
            />
          </Panel>
        ) : null}

        {state === AudioDiscoveryState.Error || state === AudioDiscoveryState.Degraded ? (
          <Panel className="mt-4" role="alert">
            <EmptyState
              action={
                <Button
                  onClick={refresh}
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

        {(state === AudioDiscoveryState.Ready || state === AudioDiscoveryState.Degraded) && devices.length > 0 ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <AudioDeviceSection
              description={audioMessages.inputsDescription}
              devices={inputs}
              messages={audioMessages}
              onSetDefault={setDefault}
              onSetMute={setMute}
              onSetVolume={setVolume}
              pending={pending}
              title={audioMessages.inputsTitle}
            />
            <AudioDeviceSection
              description={audioMessages.outputsDescription}
              devices={outputs}
              messages={audioMessages}
              onSetDefault={setDefault}
              onSetMute={setMute}
              onSetVolume={setVolume}
              pending={pending}
              title={audioMessages.outputsTitle}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
