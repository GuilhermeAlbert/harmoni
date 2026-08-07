import { invoke, isTauri } from "@tauri-apps/api/core";
import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { PeripheralDiscovery } from "@/lib/types/peripheral";

export async function getPeripherals(): Promise<PeripheralDiscovery> {
  if (!isTauri()) throw createNativeAgentError({ code: NativeAgentErrorCode.Unavailable, message: "Native peripheral discovery is unavailable." });
  try {
    return await invoke<PeripheralDiscovery>("get_peripherals");
  } catch (cause) { throw createNativeAgentError(cause); }
}
