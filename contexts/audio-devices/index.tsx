"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

import { AudioDevicesContext } from "./context";
import { AudioDiscoveryState } from "@/lib/enums/audio-discovery-state";
import { DeviceEventCategory } from "@/lib/enums/device-event-category";
import { getAudioDevices } from "@/lib/services/audio-devices";
import { subscribeToDeviceEvents } from "@/lib/services/device-events";
import type { AudioDevice } from "@/lib/types/audio-device";

export function AudioDevicesProvider({
  children,
}: PropsWithChildren): React.ReactNode {
  const [attempt, setAttempt] = useState(0);
  const [devices, setDevices] = useState<readonly AudioDevice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [state, setState] = useState(AudioDiscoveryState.Loading);

  useEffect(() => {
    let active = true;

    getAudioDevices()
      .then((nextDevices) => {
        if (!active) {
          return;
        }

        setDevices(nextDevices);
        setRefreshing(false);
        setState(AudioDiscoveryState.Ready);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setRefreshing(false);
        setState(AudioDiscoveryState.Error);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    subscribeToDeviceEvents((event) => {
      if (active && event.category === DeviceEventCategory.Audio) {
        setRefreshing(true);
        setAttempt((currentAttempt) => currentAttempt + 1);
      }
    })
      .then((nextUnsubscribe) => {
        if (active) {
          unsubscribe = nextUnsubscribe;
        } else {
          nextUnsubscribe();
        }
      })
      .catch(() => {
        if (active) {
          setState(AudioDiscoveryState.Error);
        }
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const refresh = (): void => {
    setRefreshing(true);
    setState(devices.length ? AudioDiscoveryState.Ready : AudioDiscoveryState.Loading);
    setAttempt((currentAttempt) => currentAttempt + 1);
  };

  return (
    <AudioDevicesContext.Provider
      value={{ devices, refresh, refreshing, state }}
    >
      {children}
    </AudioDevicesContext.Provider>
  );
}
