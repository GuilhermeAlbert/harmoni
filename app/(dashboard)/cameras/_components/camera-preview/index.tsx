"use client";

import { convertFileSrc } from "@tauri-apps/api/core";
import { Camera as CameraIcon, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { CameraPreviewProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonVariant } from "@/components/button/enums";
import { Panel } from "@/components/panel";
import { startCameraPreview, stopCameraPreview } from "@/lib/services/cameras";
import type { CameraPreviewSession } from "@/lib/types/camera";

type PreviewStatus = "idle" | "starting" | "running" | "error";

export function CameraPreview({ camera, messages }: CameraPreviewProps): React.ReactNode {
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [session, setSession] = useState<CameraPreviewSession | null>(null);
  const [error, setError] = useState("");
  const [frameVersion, setFrameVersion] = useState(0);
  const activeCameraId = useRef(camera.id);
  const running = useRef(false);

  const start = useCallback(async (cameraId: string): Promise<void> => {
    setStatus("starting");
    setError("");
    try {
      const nextSession = await startCameraPreview(cameraId);
      if (activeCameraId.current !== cameraId) {
        await stopCameraPreview();
        return;
      }
      running.current = true;
      setSession(nextSession);
      setFrameVersion(Date.now());
      setStatus("running");
    } catch (cause: unknown) {
      running.current = false;
      setSession(null);
      setError(cause instanceof Error ? cause.message : messages.previewError);
      setStatus("error");
    }
  }, [messages.previewError]);

  const stop = useCallback(async (): Promise<void> => {
    running.current = false;
    setSession(null);
    setStatus("idle");
    setError("");
    await stopCameraPreview().catch(() => undefined);
  }, []);

  useEffect(() => {
    const previousCameraId = activeCameraId.current;
    activeCameraId.current = camera.id;
    if (previousCameraId !== camera.id && running.current) {
      void stopCameraPreview().then(() => start(camera.id));
    }
  }, [camera.id, start]);

  useEffect(() => {
    if (status !== "running") return;
    const interval = window.setInterval(() => setFrameVersion(Date.now()), 150);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => () => {
    running.current = false;
    void stopCameraPreview();
  }, []);

  const previewSource = session
    ? `${convertFileSrc(session.filePath)}?frame=${frameVersion}`
    : null;

  return (
    <Panel className="overflow-hidden p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{messages.previewTitle}</h2>
          <p className="mt-1 text-xs text-zinc-500">{messages.previewDescription}</p>
        </div>
        <Badge tone={status === "running" ? BadgeTone.Success : BadgeTone.Neutral}>
          {status === "running" ? messages.previewRunning : messages.previewIdle}
        </Badge>
      </div>

      <div className="relative mt-5 grid aspect-video overflow-hidden rounded-2xl border border-zinc-300 bg-zinc-950 dark:border-white/[0.08]">
        {previewSource ? (
          // eslint-disable-next-line @next/next/no-img-element -- Tauri serves a changing local capture file.
          <img alt={`${messages.previewTitle}: ${camera.name}`} className="size-full object-contain" src={previewSource} />
        ) : (
          <div className="grid place-items-center text-zinc-400">
            <div className="grid justify-items-center gap-3 text-center">
              <CameraIcon aria-hidden="true" className="size-8" />
              <p className="text-sm font-semibold">{camera.name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className={`text-xs font-medium ${error ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`} role="status">
          {error || (status === "starting" ? messages.startingPreview : status === "running" ? messages.previewActive : messages.previewNotStarted)}
        </p>
        {status === "running" ? (
          <Button onClick={() => void stop()} variant={ButtonVariant.Secondary}>
            <Square aria-hidden="true" className="size-3" />{messages.stopPreview}
          </Button>
        ) : (
          <Button disabled={status === "starting"} onClick={() => void start(camera.id)}>
            <CameraIcon aria-hidden="true" className="size-4" />
            {status === "starting" ? messages.startingPreview : messages.startPreview}
          </Button>
        )}
      </div>
    </Panel>
  );
}
