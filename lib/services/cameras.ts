import { invoke, isTauri } from "@tauri-apps/api/core";

import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { CameraDiscovery } from "@/lib/types/camera";

const GET_CAMERAS_COMMAND = "get_cameras";

export async function getCameras(): Promise<CameraDiscovery> {
  if (!isTauri()) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.Unavailable,
      message: "Native camera discovery is unavailable.",
    });
  }
  try {
    return await invoke<CameraDiscovery>(GET_CAMERAS_COMMAND);
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}
