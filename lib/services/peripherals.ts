import { invoke, isTauri } from "@tauri-apps/api/core";

import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { PeripheralDiscovery } from "@/lib/types/peripheral";

const GET_PERIPHERALS_COMMAND = "get_peripherals";

export async function getPeripherals(): Promise<PeripheralDiscovery> {
  if (!isTauri()) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.Unavailable,
      message: "Native peripheral discovery is unavailable.",
    });
  }

  try {
    return await invoke<PeripheralDiscovery>(GET_PERIPHERALS_COMMAND);
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}
