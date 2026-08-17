"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

import { PeripheralsContext } from "./context";
import {
  PERIPHERAL_EVENT_CATEGORIES,
  PERIPHERAL_REFRESH_DEBOUNCE_MILLISECONDS,
} from "./constants";
import { getPeripheralFailureState } from "./helper";
import type { InputMonitoringStatus } from "@/lib/enums/input-monitoring-status";
import { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";
import { subscribeToDeviceEvents } from "@/lib/services/device-events";
import { getPeripherals } from "@/lib/services/peripherals";
import type { Peripheral } from "@/lib/types/peripheral";

export function PeripheralsProvider({
  children,
}: PropsWithChildren): React.ReactNode {
  const [attempt, setAttempt] = useState(0);
  const [inputMonitoring, setInputMonitoring] =
    useState<InputMonitoringStatus | null>(null);
  const [peripherals, setPeripherals] = useState<readonly Peripheral[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [state, setState] = useState(PeripheralDiscoveryState.Loading);
  const peripheralsRef = useRef<readonly Peripheral[]>([]);
  const refreshSequence = useRef(0);

  useEffect(() => {
    let active = true;
    const sequence = ++refreshSequence.current;

    getPeripherals()
      .then((result) => {
        if (!active || sequence !== refreshSequence.current) {
          return;
        }

        peripheralsRef.current = result.peripherals;
        setPeripherals(result.peripherals);
        setInputMonitoring(result.inputMonitoring);
        setRefreshing(false);
        setState(PeripheralDiscoveryState.Ready);
      })
      .catch(() => {
        if (!active || sequence !== refreshSequence.current) {
          return;
        }

        setRefreshing(false);
        setState(getPeripheralFailureState(peripheralsRef.current.length));
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
      if (!active || !PERIPHERAL_EVENT_CATEGORIES.includes(event.category)) {
        return;
      }

      setRefreshing(true);
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (active) {
          setAttempt((value) => value + 1);
        }
      }, PERIPHERAL_REFRESH_DEBOUNCE_MILLISECONDS);
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
          setState(getPeripheralFailureState(peripheralsRef.current.length));
        }
      });

    return () => {
      active = false;
      clearTimeout(refreshTimer);
      unsubscribe?.();
    };
  }, []);

  const refresh = (): void => {
    setRefreshing(true);
    setState(
      peripherals.length
        ? PeripheralDiscoveryState.Ready
        : PeripheralDiscoveryState.Loading,
    );
    setAttempt((value) => value + 1);
  };

  return (
    <PeripheralsContext.Provider
      value={{ inputMonitoring, peripherals, refresh, refreshing, state }}
    >
      {children}
    </PeripheralsContext.Provider>
  );
}
