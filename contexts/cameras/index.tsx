"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

import { CamerasContext } from "./context";
import { CameraDiscoveryState } from "@/lib/enums/camera-discovery-state";
import { DeviceEventCategory } from "@/lib/enums/device-event-category";
import { getCameras } from "@/lib/services/cameras";
import { subscribeToDeviceEvents } from "@/lib/services/device-events";
import type { CameraAuthorization } from "@/lib/enums/camera-authorization";
import type { Camera } from "@/lib/types/camera";

export function CamerasProvider({ children }: PropsWithChildren): React.ReactNode {
  const [attempt, setAttempt] = useState(0);
  const [authorization, setAuthorization] = useState<CameraAuthorization | null>(null);
  const [cameras, setCameras] = useState<readonly Camera[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [state, setState] = useState(CameraDiscoveryState.Loading);

  useEffect(() => {
    let active = true;
    getCameras()
      .then((discovery) => {
        if (!active) return;
        setAuthorization(discovery.authorization);
        setCameras(discovery.cameras);
        setRefreshing(false);
        setState(CameraDiscoveryState.Ready);
      })
      .catch(() => {
        if (!active) return;
        setRefreshing(false);
        setState(CameraDiscoveryState.Error);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    subscribeToDeviceEvents((event) => {
      if (active && event.category === DeviceEventCategory.Camera) {
        setRefreshing(true);
        setAttempt((current) => current + 1);
      }
    })
      .then((nextUnsubscribe) => {
        if (active) unsubscribe = nextUnsubscribe;
        else nextUnsubscribe();
      })
      .catch(() => {
        if (active) setState(CameraDiscoveryState.Error);
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const refresh = (): void => {
    setRefreshing(true);
    setState(cameras.length ? CameraDiscoveryState.Ready : CameraDiscoveryState.Loading);
    setAttempt((current) => current + 1);
  };

  return (
    <CamerasContext.Provider value={{ authorization, cameras, refresh, refreshing, state }}>
      {children}
    </CamerasContext.Provider>
  );
}
