"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  Headphones,
  Keyboard,
  Mic2,
  RefreshCw,
  Unplug,
} from "lucide-react";

import { DevicePanel } from "./device-panel";
import { MetricCard } from "./metric-card";
import { QuickActions } from "./quick-actions";
import { StateSelector } from "./state-selector";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { useAudioDevices } from "@/contexts/audio-devices/use-audio-devices";
import { useLanguage } from "@/contexts/language/use-language";
import { DEVICE_FIXTURES } from "@/lib/constants/device-fixtures";
import { AudioDirection } from "@/lib/enums/audio-direction";
import { AudioDiscoveryState } from "@/lib/enums/audio-discovery-state";
import { DeviceCategory } from "@/lib/enums/device-category";
import { DeviceConnectionStatus } from "@/lib/enums/device-connection-status";
import { OverviewFixtureState } from "@/lib/enums/overview-fixture-state";
import type { Device } from "@/lib/types/device";

const REFRESH_FEEDBACK_DELAY_MS = 700;

function copyDeviceFixtures(): Device[] {
  return DEVICE_FIXTURES.map((device): Device => ({ ...device }));
}

export function Overview(): React.ReactNode {
  const [devices, setDevices] = useState<Device[]>(copyDeviceFixtures);
  const [feedback, setFeedback] = useState("");
  const [fixtureState, setFixtureState] = useState(
    OverviewFixtureState.Success,
  );
  const [refreshingFixtures, setRefreshingFixtures] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { messages } = useLanguage();
  const {
    devices: audioDevices,
    refresh: refreshAudioDevices,
    refreshing: refreshingAudio,
    state: audioDiscoveryState,
  } = useAudioDevices();
  const overviewMessages = messages.overview;
  const refreshing = refreshingFixtures || refreshingAudio;

  useEffect(
    () => () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    },
    [],
  );

  const activeAudioInput =
    audioDevices.find(
      (device) =>
        device.direction === AudioDirection.Input && device.isDefault,
    ) ??
    audioDevices.find((device) => device.direction === AudioDirection.Input);
  const activeAudioOutput =
    audioDevices.find(
      (device) =>
        device.direction === AudioDirection.Output && device.isDefault,
    ) ??
    audioDevices.find((device) => device.direction === AudioDirection.Output);
  const activeCamera = devices.find(
    (device) =>
      device.category === DeviceCategory.Camera &&
      device.active &&
      device.enabled,
  );
  const connectedPeripherals = devices.filter(
    (device) =>
      [
        DeviceCategory.Keyboard,
        DeviceCategory.Mouse,
        DeviceCategory.Trackpad,
      ].includes(device.category) &&
      device.connection === DeviceConnectionStatus.Connected,
  );

  const handleToggleDevice = (deviceId: string, enabled: boolean): void => {
    setDevices((currentDevices) =>
      currentDevices.map((device) =>
        device.id === deviceId
          ? { ...device, active: enabled ? device.active : false, enabled }
          : device,
      ),
    );
    setFeedback(
      enabled
        ? overviewMessages.feedback.deviceEnabled
        : overviewMessages.feedback.deviceDisabled,
    );
  };

  const handleRefresh = (): void => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    setRefreshingFixtures(true);
    refreshAudioDevices();
    setFeedback("");
    refreshTimerRef.current = setTimeout(() => {
      setDevices(copyDeviceFixtures());
      setFixtureState(OverviewFixtureState.Success);
      setRefreshingFixtures(false);
      setFeedback(overviewMessages.feedback.refreshed);
      refreshTimerRef.current = null;
    }, REFRESH_FEEDBACK_DELAY_MS);
  };

  const handlePrivacyMode = (): void => {
    setDevices((currentDevices) =>
      currentDevices.map((device) =>
        device.category === DeviceCategory.Camera
          ? { ...device, active: false, enabled: false }
          : device,
      ),
    );
    setFeedback(overviewMessages.feedback.privacyEnabled);
  };

  const handleApplyWorkProfile = (): void => {
    setDevices(copyDeviceFixtures());
    setFeedback(overviewMessages.feedback.workApplied);
  };

  const handleDisableCameras = (): void => {
    setDevices((currentDevices) =>
      currentDevices.map((device) =>
        device.category === DeviceCategory.Camera
          ? { ...device, active: false, enabled: false }
          : device,
      ),
    );
    setFeedback(overviewMessages.feedback.camerasDisabled);
  };

  const handleSelectRecordingProfile = (): void => {
    setDevices((currentDevices) =>
      currentDevices.map((device) =>
        device.category === DeviceCategory.Camera
          ? { ...device, active: true, enabled: true, muted: false }
          : device,
      ),
    );
    setFeedback(overviewMessages.feedback.recordingApplied);
  };

  const describeAudioDevice = (
    device: (typeof audioDevices)[number] | undefined,
  ): string => {
    if (audioDiscoveryState === AudioDiscoveryState.Error) {
      return overviewMessages.metrics.audioUnavailable;
    }

    if (!device) {
      return overviewMessages.metrics.noActiveDevice;
    }

    const volume =
      device.volume === null
        ? overviewMessages.metrics.unavailableReading
        : `${device.volume}% ${overviewMessages.metrics.volume}`;
    const mute =
      device.muted === null
        ? overviewMessages.metrics.unavailableReading
        : device.muted
          ? overviewMessages.metrics.muted
          : overviewMessages.metrics.unmuted;

    return `${volume} · ${mute}`;
  };
  const audioInputDescription = describeAudioDevice(activeAudioInput);
  const audioOutputDescription = describeAudioDevice(activeAudioOutput);
  const cameraDescription = activeCamera
    ? `${activeCamera.cameraResolution} · ${activeCamera.cameraZoom?.toFixed(2)}× ${overviewMessages.metrics.zoom}`
    : overviewMessages.metrics.noActiveDevice;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Warning}>{overviewMessages.fixtureLabel}</Badge>
            <p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {overviewMessages.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-geist)] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-4xl lg:text-5xl">
              {overviewMessages.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {overviewMessages.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrivacyMode} variant={ButtonVariant.Secondary}>
              {overviewMessages.privacyMode}
            </Button>
            <Button onClick={handleApplyWorkProfile}>
              {overviewMessages.applyWorkProfile}
            </Button>
            <Button
              aria-busy={refreshing}
              disabled={refreshing}
              onClick={handleRefresh}
              variant={ButtonVariant.Ghost}
            >
              <RefreshCw
                aria-hidden="true"
                className={`size-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
              />
              {refreshing
                ? overviewMessages.refreshing
                : overviewMessages.refresh}
            </Button>
          </div>
        </div>

        <div className="mt-6 max-w-xl">
          <StateSelector
            messages={overviewMessages}
            onChange={(state) => {
              setFixtureState(state);
              setFeedback("");
            }}
            value={fixtureState}
          />
        </div>

        <p
          aria-live="polite"
          className="mt-4 min-h-5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          role="status"
        >
          {feedback}
        </p>

        {fixtureState === OverviewFixtureState.Loading ? (
          <Panel className="mt-4 grid min-h-80 place-items-center p-8">
            <div className="grid justify-items-center gap-3 text-sm text-zinc-500">
              <Spinner label={overviewMessages.loading} />
              <span>{overviewMessages.loading}</span>
            </div>
          </Panel>
        ) : null}

        {fixtureState === OverviewFixtureState.Empty ? (
          <Panel className="mt-4">
            <EmptyState
              description={overviewMessages.emptyDescription}
              icon={Unplug}
              title={overviewMessages.emptyTitle}
            />
          </Panel>
        ) : null}

        {fixtureState === OverviewFixtureState.Error ? (
          <Panel className="mt-4">
            <EmptyState
              action={
                <Button
                  onClick={() => setFixtureState(OverviewFixtureState.Success)}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                >
                  {overviewMessages.retry}
                </Button>
              }
              description={overviewMessages.errorDescription}
              icon={AlertTriangle}
              title={overviewMessages.errorTitle}
            />
          </Panel>
        ) : null}

        {fixtureState === OverviewFixtureState.Success ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                description={audioInputDescription}
                icon={Mic2}
                title={overviewMessages.metrics.audioInput}
                value={
                  audioDiscoveryState === AudioDiscoveryState.Loading
                    ? overviewMessages.metrics.loading
                    : (activeAudioInput?.name ??
                      overviewMessages.metrics.noActiveDevice)
                }
              />
              <MetricCard
                description={audioOutputDescription}
                icon={Headphones}
                title={overviewMessages.metrics.audioOutput}
                value={
                  audioDiscoveryState === AudioDiscoveryState.Loading
                    ? overviewMessages.metrics.loading
                    : (activeAudioOutput?.name ??
                      overviewMessages.metrics.noActiveDevice)
                }
              />
              <MetricCard
                description={cameraDescription}
                icon={Camera}
                title={overviewMessages.metrics.camera}
                value={
                  activeCamera?.name ?? overviewMessages.metrics.noActiveDevice
                }
              />
              <MetricCard
                description={overviewMessages.metrics.allResponding}
                icon={Keyboard}
                title={overviewMessages.metrics.peripherals}
                value={`${connectedPeripherals.length} ${overviewMessages.metrics.connected}`}
              />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
              <DevicePanel
                devices={devices}
                messages={overviewMessages.devices}
                onToggleDevice={handleToggleDevice}
              />
              <QuickActions
                messages={overviewMessages.quickActions}
                onDisableCameras={handleDisableCameras}
                onSelectRecordingProfile={handleSelectRecordingProfile}
              />
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
