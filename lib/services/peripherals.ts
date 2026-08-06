import { invoke, isTauri } from "@tauri-apps/api/core";
import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { PeripheralConnection } from "@/lib/enums/peripheral-connection";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { Peripheral, PeripheralDiscovery } from "@/lib/types/peripheral";

interface NativePeripheralDiscovery { inputMonitoring: string; peripherals: Array<Omit<Peripheral, "connection" | "enabled"> & { connected: boolean }> }

export async function getPeripherals(): Promise<PeripheralDiscovery> {
  if (!isTauri()) throw createNativeAgentError({ code: NativeAgentErrorCode.Unavailable, message: "Native peripheral discovery is unavailable." });
  try {
    const result = await invoke<NativePeripheralDiscovery>("get_peripherals");
    return { inputMonitoring: result.inputMonitoring, peripherals: result.peripherals.map(({ connected, ...item }) => ({ ...item, connection: connected ? PeripheralConnection.Connected : PeripheralConnection.Disconnected, enabled: connected })) };
  } catch (cause) { throw createNativeAgentError(cause); }
}
