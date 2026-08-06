"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { AlertTriangle, CameraOff } from "lucide-react";

import { CameraControls } from "../camera-controls";
import { CameraList } from "../camera-list";
import { CameraPreview } from "../camera-preview";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { useLanguage } from "@/contexts/language/use-language";
import { CAMERA_FIXTURES } from "@/lib/constants/camera-fixtures";
import { CameraFixtureState } from "@/lib/enums/camera-fixture-state";
import { CameraStatus } from "@/lib/enums/camera-status";
import type { Camera } from "@/lib/types/camera";

const CAMERA_FIXTURE_STATES = [
  CameraFixtureState.Success,
  CameraFixtureState.Loading,
  CameraFixtureState.Empty,
  CameraFixtureState.Error,
] as const;

function copyCameraFixtures(): Camera[] {
  return CAMERA_FIXTURES.map((camera: Camera): Camera => ({
    ...camera,
    capabilities: {
      exposure: camera.capabilities.exposure
        ? { ...camera.capabilities.exposure }
        : undefined,
      zoom: camera.capabilities.zoom
        ? { ...camera.capabilities.zoom }
        : undefined,
    },
    format: { ...camera.format },
  }));
}

function isCameraFixtureState(value: string): value is CameraFixtureState {
  return CAMERA_FIXTURE_STATES.some((state) => state === value);
}

export function CameraScreen(): React.ReactNode {
  const [cameras, setCameras] = useState<Camera[]>(copyCameraFixtures);
  const [feedback, setFeedback] = useState("");
  const [fixtureState, setFixtureState] = useState(CameraFixtureState.Success);
  const { messages } = useLanguage();
  const cameraMessages = messages.cameras;
  const preferredCamera =
    cameras.find((camera) => camera.preferred) ?? cameras[0];

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (isCameraFixtureState(event.target.value)) {
      setFixtureState(event.target.value);
      setFeedback("");
    }
  };

  const handleMakePreferred = (cameraId: string): void => {
    const selectedCamera = cameras.find((camera) => camera.id === cameraId);

    if (!selectedCamera || selectedCamera.status !== CameraStatus.Available) {
      return;
    }

    setCameras((currentCameras) =>
      currentCameras.map((camera) => ({
        ...camera,
        live: camera.id === cameraId,
        preferred: camera.id === cameraId,
      })),
    );
    setFeedback(cameraMessages.feedback.preferredChanged);
  };

  const handleZoomChange = (value: number): void => {
    const capability = preferredCamera.capabilities.zoom;

    if (!capability) {
      return;
    }

    const safeValue = Math.min(capability.max, Math.max(capability.min, value));
    setCameras((currentCameras) =>
      currentCameras.map((camera) =>
        camera.id === preferredCamera.id
          ? { ...camera, zoom: safeValue }
          : camera,
      ),
    );
    setFeedback(cameraMessages.feedback.zoomChanged);
  };

  const handleExposureChange = (value: number): void => {
    const capability = preferredCamera.capabilities.exposure;

    if (!capability) {
      return;
    }

    const safeValue = Math.min(capability.max, Math.max(capability.min, value));
    setCameras((currentCameras) =>
      currentCameras.map((camera) =>
        camera.id === preferredCamera.id
          ? { ...camera, exposure: safeValue }
          : camera,
      ),
    );
    setFeedback(cameraMessages.feedback.exposureChanged);
  };

  const restoreSuccessState = (): void => {
    setCameras(copyCameraFixtures());
    setFixtureState(CameraFixtureState.Success);
    setFeedback("");
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Warning}>{cameraMessages.fixtureLabel}</Badge>
            <p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {cameraMessages.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-geist)] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-4xl">
              {cameraMessages.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {cameraMessages.description}
            </p>
          </div>

          <label className="grid min-w-52 gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {cameraMessages.stateLabel}
            <select
              className="min-h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:outline-white"
              onChange={handleStateChange}
              value={fixtureState}
            >
              {CAMERA_FIXTURE_STATES.map((state) => (
                <option key={state} value={state}>
                  {cameraMessages.states[state]}
                </option>
              ))}
            </select>
            <span className="font-normal text-zinc-500">
              {cameraMessages.stateHint}
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

        {fixtureState === CameraFixtureState.Loading ? (
          <Panel className="mt-4 grid min-h-80 place-items-center p-8">
            <div className="grid justify-items-center gap-3 text-sm text-zinc-500">
              <Spinner label={cameraMessages.loading} />
              <span>{cameraMessages.loading}</span>
            </div>
          </Panel>
        ) : null}

        {fixtureState === CameraFixtureState.Empty ? (
          <Panel aria-live="polite" className="mt-4">
            <EmptyState
              description={cameraMessages.emptyDescription}
              icon={CameraOff}
              title={cameraMessages.emptyTitle}
            />
          </Panel>
        ) : null}

        {fixtureState === CameraFixtureState.Error ? (
          <Panel className="mt-4" role="alert">
            <EmptyState
              action={
                <Button
                  onClick={restoreSuccessState}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                >
                  {cameraMessages.retry}
                </Button>
              }
              description={cameraMessages.errorDescription}
              icon={AlertTriangle}
              title={cameraMessages.errorTitle}
            />
          </Panel>
        ) : null}

        {fixtureState === CameraFixtureState.Success ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <CameraList
              cameras={cameras}
              messages={cameraMessages}
              onMakePreferred={handleMakePreferred}
            />
            <div className="grid content-start gap-4">
              <CameraPreview
                camera={preferredCamera}
                messages={cameraMessages}
              />
              <CameraControls
                camera={preferredCamera}
                messages={cameraMessages}
                onExposureChange={handleExposureChange}
                onZoomChange={handleZoomChange}
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
