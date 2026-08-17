"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

import { CamerasContext } from "./context";
import { CAMERA_REFRESH_DEBOUNCE_MILLISECONDS } from "./constants";
import { getCameraFailureState } from "./helper";
import { CameraDiscoveryState } from "@/lib/enums/camera-discovery-state";
import { CameraAction } from "@/lib/enums/camera-action";
import { CameraMutationStatus } from "@/lib/enums/camera-mutation-status";
import { DeviceEventCategory } from "@/lib/enums/device-event-category";
import {
  getCameras,
  resetPreferredCamera,
  setCameraExposure,
  setCameraZoom,
  setPreferredCamera,
} from "@/lib/services/cameras";
import { subscribeToDeviceEvents } from "@/lib/services/device-events";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { CameraAuthorization } from "@/lib/enums/camera-authorization";
import type { Camera } from "@/lib/types/camera";
import type { CameraMutation, CameraPendingAction } from "./types";

export function CamerasProvider({ children }: PropsWithChildren): React.ReactNode {
  const [attempt, setAttempt] = useState(0);
  const [authorization, setAuthorization] = useState<CameraAuthorization | null>(null);
  const [cameras, setCameras] = useState<readonly Camera[]>([]);
  const [mutation, setMutation] = useState<CameraMutation | null>(null);
  const [pending, setPending] = useState<CameraPendingAction | null>(null);
  const [preferredCameraId, setPreferredCameraId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [state, setState] = useState(CameraDiscoveryState.Loading);
  const activeMutation = useRef<number | null>(null);
  const camerasRef = useRef<readonly Camera[]>([]);
  const mutationSequence = useRef(0);
  const refreshSequence = useRef(0);

  useEffect(() => {
    let active = true;
    const sequence = ++refreshSequence.current;
    getCameras()
      .then((discovery) => {
        if (!active || sequence !== refreshSequence.current) return;
        setAuthorization(discovery.authorization);
        camerasRef.current = discovery.cameras;
        setCameras(discovery.cameras);
        setPreferredCameraId(discovery.preferredCameraId);
        setRefreshing(false);
        setState(CameraDiscoveryState.Ready);
      })
      .catch(() => {
        if (!active || sequence !== refreshSequence.current) return;
        setRefreshing(false);
        setState(getCameraFailureState(camerasRef.current.length));
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    subscribeToDeviceEvents((event) => {
      if (active && event.category === DeviceEventCategory.Camera) {
        setRefreshing(true);
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => {
          if (active) setAttempt((current) => current + 1);
        }, CAMERA_REFRESH_DEBOUNCE_MILLISECONDS);
      }
    })
      .then((nextUnsubscribe) => {
        if (active) unsubscribe = nextUnsubscribe;
        else nextUnsubscribe();
      })
      .catch(() => {
        if (active) setState(getCameraFailureState(camerasRef.current.length));
      });
    return () => {
      active = false;
      clearTimeout(refreshTimer);
      unsubscribe?.();
    };
  }, []);

  const refresh = (): void => {
    setRefreshing(true);
    setState(cameras.length ? CameraDiscoveryState.Ready : CameraDiscoveryState.Loading);
    setAttempt((current) => current + 1);
  };

  const runMutation = async (
    target: CameraPendingAction,
    optimistic: readonly Camera[],
    operation: () => Promise<void>,
  ): Promise<void> => {
    if (activeMutation.current !== null) {
      return;
    }

    const mutationToken = ++mutationSequence.current;
    activeMutation.current = mutationToken;
    const previous = cameras;
    setCameras(optimistic);
    setMutation(null);
    setPending(target);
    try {
      await operation();
      if (activeMutation.current === mutationToken) {
        setMutation({ ...target, status: CameraMutationStatus.Success });
      }
    } catch (cause: unknown) {
      if (activeMutation.current !== mutationToken) {
        return;
      }
      setCameras(previous);
      setMutation({
        ...target,
        message: createNativeAgentError(cause).message,
        status: CameraMutationStatus.Error,
      });
      setRefreshing(true);
      setAttempt((current) => current + 1);
    } finally {
      if (activeMutation.current === mutationToken) {
        activeMutation.current = null;
        setPending(null);
      }
    }
  };

  const setPreferred = async (camera: Camera): Promise<void> => {
    await runMutation(
      { action: CameraAction.Preference, cameraId: camera.id },
      cameras.map((candidate) => ({ ...candidate, preferred: candidate.id === camera.id })),
      async () => {
        const preference = await setPreferredCamera(camera.id);
        setPreferredCameraId(preference.preferredCameraId);
      },
    );
  };

  const resetPreferred = async (): Promise<void> => {
    await runMutation(
      { action: CameraAction.Preference, cameraId: preferredCameraId },
      cameras.map((camera) => ({ ...camera, preferred: false })),
      async () => {
        const preference = await resetPreferredCamera();
        setPreferredCameraId(preference.preferredCameraId);
      },
    );
  };

  const setControl = async (
    camera: Camera,
    value: number,
    action: CameraAction.Zoom | CameraAction.Exposure,
  ): Promise<void> => {
    const capability = action === CameraAction.Zoom ? camera.zoom : camera.exposure;
    if (!capability?.canControl || value < capability.min || value > capability.max) return;
    await runMutation(
      { action, cameraId: camera.id },
      cameras.map((candidate) =>
        candidate.id === camera.id
          ? { ...candidate, [action]: { ...capability, value } }
          : candidate,
      ),
      async () => {
        const refreshed = action === CameraAction.Zoom
          ? await setCameraZoom(camera.id, value)
          : await setCameraExposure(camera.id, value);
        setCameras((current) => current.map((candidate) =>
          candidate.id === refreshed.id
            ? { ...refreshed, preferred: refreshed.id === preferredCameraId }
            : candidate,
        ));
      },
    );
  };

  const setZoom = (camera: Camera, value: number): Promise<void> =>
    setControl(camera, value, CameraAction.Zoom);
  const setExposure = (camera: Camera, value: number): Promise<void> =>
    setControl(camera, value, CameraAction.Exposure);

  return (
    <CamerasContext.Provider value={{
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
    }}>
      {children}
    </CamerasContext.Provider>
  );
}
