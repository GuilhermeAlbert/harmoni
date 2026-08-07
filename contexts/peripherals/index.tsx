"use client";
import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import { PeripheralsContext } from "./context";
import { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";
import { DeviceEventCategory } from "@/lib/enums/device-event-category";
import { getPeripherals } from "@/lib/services/peripherals";
import { subscribeToDeviceEvents } from "@/lib/services/device-events";
import type { Peripheral } from "@/lib/types/peripheral";

export function PeripheralsProvider({ children }: PropsWithChildren): React.ReactNode {
  const [attempt, setAttempt] = useState(0); const [peripherals, setPeripherals] = useState<readonly Peripheral[]>([]);
  const [inputMonitoring, setInputMonitoring] = useState<string | null>(null); const [refreshing, setRefreshing] = useState(false); const [state, setState] = useState(PeripheralDiscoveryState.Loading);
  const peripheralsRef = useRef<readonly Peripheral[]>([]); const refreshSequence = useRef(0);
  useEffect(() => { let active = true; const sequence = ++refreshSequence.current; getPeripherals().then(result => { if (!active || sequence !== refreshSequence.current) return; peripheralsRef.current = result.peripherals; setPeripherals(result.peripherals); setInputMonitoring(result.inputMonitoring); setRefreshing(false); setState(PeripheralDiscoveryState.Ready); }).catch(() => { if (active && sequence === refreshSequence.current) { setRefreshing(false); setState(peripheralsRef.current.length ? PeripheralDiscoveryState.Degraded : PeripheralDiscoveryState.Error); } }); return () => { active = false; }; }, [attempt]);
  useEffect(() => { let active = true; let unsubscribe: (() => void) | undefined; let refreshTimer: ReturnType<typeof setTimeout> | undefined; subscribeToDeviceEvents(event => { if (active && [DeviceEventCategory.Peripheral, DeviceEventCategory.Keyboard, DeviceEventCategory.Mouse, DeviceEventCategory.Trackpad].includes(event.category)) { setRefreshing(true); clearTimeout(refreshTimer); refreshTimer = setTimeout(() => { if (active) setAttempt(value => value + 1); }, 150); } }).then(next => { if (active) unsubscribe = next; else next(); }).catch(() => { if (active) setState(peripheralsRef.current.length ? PeripheralDiscoveryState.Degraded : PeripheralDiscoveryState.Error); }); return () => { active = false; clearTimeout(refreshTimer); unsubscribe?.(); }; }, []);
  const refresh = () => { setRefreshing(true); setState(peripherals.length ? PeripheralDiscoveryState.Ready : PeripheralDiscoveryState.Loading); setAttempt(value => value + 1); };
  return <PeripheralsContext.Provider value={{ inputMonitoring, peripherals, refresh, refreshing, state }}>{children}</PeripheralsContext.Provider>;
}
