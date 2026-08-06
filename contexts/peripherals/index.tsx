"use client";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { PeripheralsContext } from "./context";
import { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";
import { DeviceEventCategory } from "@/lib/enums/device-event-category";
import { getPeripherals } from "@/lib/services/peripherals";
import { subscribeToDeviceEvents } from "@/lib/services/device-events";
import type { Peripheral } from "@/lib/types/peripheral";

export function PeripheralsProvider({ children }: PropsWithChildren): React.ReactNode {
  const [attempt, setAttempt] = useState(0); const [peripherals, setPeripherals] = useState<readonly Peripheral[]>([]);
  const [inputMonitoring, setInputMonitoring] = useState<string | null>(null); const [refreshing, setRefreshing] = useState(false); const [state, setState] = useState(PeripheralDiscoveryState.Loading);
  useEffect(() => { let active = true; getPeripherals().then(result => { if (!active) return; setPeripherals(result.peripherals); setInputMonitoring(result.inputMonitoring); setRefreshing(false); setState(PeripheralDiscoveryState.Ready); }).catch(() => { if (active) { setRefreshing(false); setState(PeripheralDiscoveryState.Error); } }); return () => { active = false; }; }, [attempt]);
  useEffect(() => { let active = true; let unsubscribe: (() => void) | undefined; subscribeToDeviceEvents(event => { if (active && event.category === DeviceEventCategory.Peripheral) { setRefreshing(true); setAttempt(value => value + 1); } }).then(next => { if (active) unsubscribe = next; else next(); }).catch(() => { if (active) setState(PeripheralDiscoveryState.Error); }); return () => { active = false; unsubscribe?.(); }; }, []);
  const refresh = () => { setRefreshing(true); setState(peripherals.length ? PeripheralDiscoveryState.Ready : PeripheralDiscoveryState.Loading); setAttempt(value => value + 1); };
  return <PeripheralsContext.Provider value={{ inputMonitoring, peripherals, refresh, refreshing, state }}>{children}</PeripheralsContext.Provider>;
}
