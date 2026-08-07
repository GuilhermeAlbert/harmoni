"use client";

import { AlertTriangle, CameraOff, RefreshCw } from "lucide-react";

import { CameraControls } from "../camera-controls";
import { CameraList } from "../camera-list";
import { CameraPreview } from "../camera-preview";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { DevicePicker } from "@/components/device-picker";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { useCameras } from "@/contexts/cameras/use-cameras";
import { useLanguage } from "@/contexts/language/use-language";
import { CameraDiscoveryState } from "@/lib/enums/camera-discovery-state";
import { CameraMutationStatus } from "@/lib/enums/camera-mutation-status";
import { CameraAction } from "@/lib/enums/camera-action";

export function CameraScreen(): React.ReactNode {
  const {
    authorization,
    cameras,
    mutation,
    pending,
    preferredCameraId,
    refresh,
    refreshing,
    resetPreferred,
    setExposure,
    setPreferred,
    setZoom,
    state,
  } = useCameras();
  const { messages } = useLanguage();
  const cameraMessages = messages.cameras;
  const preferredCamera = cameras.find((camera) => camera.preferred) ?? cameras[0];
  const disconnectedPreference =
    preferredCameraId !== null && !cameras.some((camera) => camera.id === preferredCameraId);
  const feedback = pending
    ? cameraMessages.feedback.pending
    : mutation?.status === CameraMutationStatus.Error
      ? mutation.message ?? cameraMessages.feedback.failure
      : mutation?.action === CameraAction.Preference
        ? cameraMessages.feedback.preferenceSaved
        : mutation
          ? cameraMessages.feedback.controlApplied
          : "";

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Success}>{cameraMessages.realDataLabel}</Badge>
            <p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {cameraMessages.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-geist)] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-4xl">
              {cameraMessages.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {cameraMessages.description}
            </p>
            {authorization ? (
              <p className="mt-3 text-xs text-zinc-500">
                {cameraMessages.authorization}: {cameraMessages.authorizationStates[authorization]}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {preferredCameraId ? (
              <Button disabled={pending !== null} onClick={() => void resetPreferred()} variant={ButtonVariant.Ghost}>
                {cameraMessages.resetPreference}
              </Button>
            ) : null}
            <Button
              disabled={refreshing || state === CameraDiscoveryState.Loading}
              onClick={refresh}
              variant={ButtonVariant.Secondary}
            >
              <RefreshCw aria-hidden="true" className={`size-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`} />
              {refreshing ? cameraMessages.refreshing : cameraMessages.refresh}
            </Button>
          </div>
        </div>

        <p aria-live="polite" className="mt-5 min-h-5 text-sm font-medium text-zinc-700 dark:text-zinc-300" role="status">
          {refreshing ? cameraMessages.refreshing : feedback}
        </p>

        {disconnectedPreference ? (
          <Panel className="mt-4 p-4" role="status">
            <p className="text-sm font-medium">{cameraMessages.preferredDisconnected}</p>
            <p className="mt-1 text-xs text-zinc-500">{cameraMessages.preferredDisconnectedDescription}</p>
          </Panel>
        ) : null}

        {state === CameraDiscoveryState.Loading ? (
          <Panel className="mt-4 grid min-h-80 place-items-center p-8">
            <div className="grid justify-items-center gap-3 text-sm text-zinc-500">
              <Spinner label={cameraMessages.loading} />
              <span>{cameraMessages.loading}</span>
            </div>
          </Panel>
        ) : null}

        {state === CameraDiscoveryState.Ready && cameras.length === 0 ? (
          <Panel aria-live="polite" className="mt-4">
            <EmptyState description={cameraMessages.emptyDescription} icon={CameraOff} title={cameraMessages.emptyTitle} />
          </Panel>
        ) : null}

        {state === CameraDiscoveryState.Error || state === CameraDiscoveryState.Degraded ? (
          <Panel className="mt-4" role="alert">
            <EmptyState
              action={<Button onClick={refresh} size={ButtonSize.Small} variant={ButtonVariant.Secondary}>{cameraMessages.retry}</Button>}
              description={cameraMessages.errorDescription}
              icon={AlertTriangle}
              title={cameraMessages.errorTitle}
            />
          </Panel>
        ) : null}

        {(state === CameraDiscoveryState.Ready || state === CameraDiscoveryState.Degraded) && cameras.length ? (
          <Panel className="mt-4 p-5">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{cameraMessages.preferredPickerLabel}</p>
            <div className="mt-2">
              <DevicePicker
                disabled={pending?.action === CameraAction.Preference}
                label={cameraMessages.preferredPickerLabel}
                onChange={(cameraId) => {
                  const selected = cameras.find((camera) => camera.id === cameraId);
                  if (selected) void setPreferred(selected);
                }}
                options={cameras.map((camera) => ({ label: camera.name, value: camera.id }))}
                placeholder={cameraMessages.choosePreferredCamera}
                value={cameras.some((camera) => camera.id === preferredCameraId) ? preferredCameraId ?? "" : ""}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{cameraMessages.preferredPickerHint}</p>
          </Panel>
        ) : null}

        {(state === CameraDiscoveryState.Ready || state === CameraDiscoveryState.Degraded) && preferredCamera ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <CameraList
              cameras={cameras}
              messages={cameraMessages}
              onSetPreferred={setPreferred}
              pending={pending}
            />
            <div className="grid content-start gap-4">
              <CameraPreview camera={preferredCamera} messages={cameraMessages} />
              <CameraControls
                camera={preferredCamera}
                messages={cameraMessages}
                onExposureChange={setExposure}
                onZoomChange={setZoom}
                pending={pending}
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
