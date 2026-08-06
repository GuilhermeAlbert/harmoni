"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

import { AudioDevicesContext } from "./context";
import { AudioDiscoveryState } from "@/lib/enums/audio-discovery-state";
import { AudioControl } from "@/lib/enums/audio-control";
import { AudioMutationStatus } from "@/lib/enums/audio-mutation-status";
import { DeviceEventCategory } from "@/lib/enums/device-event-category";
import {
  getAudioDevices,
  setAudioMute,
  setAudioVolume,
  setDefaultAudioDevice,
} from "@/lib/services/audio-devices";
import { subscribeToDeviceEvents } from "@/lib/services/device-events";
import type { AudioDevice } from "@/lib/types/audio-device";
import type {
  AudioMutationState,
  AudioPendingMutation,
} from "./types";

export function AudioDevicesProvider({
  children,
}: PropsWithChildren): React.ReactNode {
  const [attempt, setAttempt] = useState(0);
  const [devices, setDevices] = useState<readonly AudioDevice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [state, setState] = useState(AudioDiscoveryState.Loading);
  const [mutation, setMutation] = useState<AudioMutationState | null>(null);
  const [pending, setPending] = useState<AudioPendingMutation | null>(null);

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

  const mutate = async (
    optimisticDevices: readonly AudioDevice[],
    target: AudioPendingMutation,
    operation: () => Promise<AudioDevice>,
  ): Promise<void> => {
    const previousDevices = devices;
    setDevices(optimisticDevices);
    setMutation(null);
    setPending(target);
    try {
      const refreshed = await operation();
      setDevices((currentDevices) =>
        currentDevices.map((device) =>
          device.id === refreshed.id ? refreshed : device,
        ),
      );
      setMutation({ ...target, status: AudioMutationStatus.Success });
    } catch {
      setDevices(previousDevices);
      setMutation({ ...target, status: AudioMutationStatus.Error });
    } finally {
      setPending(null);
    }
  };

  const setDefault = async (device: AudioDevice): Promise<void> => {
    await mutate(
      devices.map((candidate) =>
        candidate.direction === device.direction
          ? { ...candidate, isDefault: candidate.id === device.id }
          : candidate,
      ),
      { control: AudioControl.Default, deviceId: device.id },
      () => setDefaultAudioDevice(device),
    );
  };

  const setMute = async (
    device: AudioDevice,
    muted: boolean,
  ): Promise<void> => {
    await mutate(
      devices.map((candidate) =>
        candidate.id === device.id ? { ...candidate, muted } : candidate,
      ),
      { control: AudioControl.Mute, deviceId: device.id },
      () => setAudioMute(device.id, muted),
    );
  };

  const setVolume = async (
    device: AudioDevice,
    volume: number,
  ): Promise<void> => {
    await mutate(
      devices.map((candidate) =>
        candidate.id === device.id ? { ...candidate, volume } : candidate,
      ),
      { control: AudioControl.Volume, deviceId: device.id },
      () => setAudioVolume(device.id, volume),
    );
  };

  return (
    <AudioDevicesContext.Provider
      value={{
        devices,
        mutation,
        pending,
        refresh,
        refreshing,
        setDefault,
        setMute,
        setVolume,
        state,
      }}
    >
      {children}
    </AudioDevicesContext.Provider>
  );
}
