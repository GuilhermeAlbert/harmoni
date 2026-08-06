import { invoke, isTauri } from "@tauri-apps/api/core";

import type { PermissionCategory } from "@/lib/enums/permission-category";
import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { Permission } from "@/lib/types/permission";

const GET_PERMISSION_STATUS_COMMAND = "get_permission_status";
const OPEN_PERMISSION_SETTINGS_COMMAND = "open_permission_settings";

export async function getPermissionStatus(): Promise<Permission[]> {
  assertNativeEnvironment();

  try {
    return await invoke<Permission[]>(GET_PERMISSION_STATUS_COMMAND);
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}

export async function openPermissionSettings(
  category: PermissionCategory,
): Promise<void> {
  assertNativeEnvironment();

  try {
    await invoke(OPEN_PERMISSION_SETTINGS_COMMAND, { category });
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}

function assertNativeEnvironment(): void {
  if (!isTauri()) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.Unavailable,
      message: "The native agent is unavailable.",
    });
  }
}
