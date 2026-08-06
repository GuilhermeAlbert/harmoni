import { invoke, isTauri } from "@tauri-apps/api/core";

import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { CameraDiscovery } from "@/lib/types/camera";
import type { Camera } from "@/lib/types/camera";
import type { CameraPreference } from "@/lib/types/preferences";

const GET_CAMERAS_COMMAND = "get_cameras";
const RESET_PREFERRED_CAMERA_COMMAND = "reset_preferred_camera";
const SET_CAMERA_EXPOSURE_COMMAND = "set_camera_exposure";
const SET_CAMERA_ZOOM_COMMAND = "set_camera_zoom";
const SET_PREFERRED_CAMERA_COMMAND = "set_preferred_camera";

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

export async function setPreferredCamera(cameraId: string): Promise<CameraPreference> {
  return invokeCameraPreference(SET_PREFERRED_CAMERA_COMMAND, { cameraId });
}

export async function resetPreferredCamera(): Promise<CameraPreference> {
  return invokeCameraPreference(RESET_PREFERRED_CAMERA_COMMAND);
}

export async function setCameraZoom(cameraId: string, value: number): Promise<Camera> {
  return invokeCameraMutation(SET_CAMERA_ZOOM_COMMAND, cameraId, value);
}

export async function setCameraExposure(cameraId: string, value: number): Promise<Camera> {
  return invokeCameraMutation(SET_CAMERA_EXPOSURE_COMMAND, cameraId, value);
}

async function invokeCameraPreference(
  command: string,
  args?: { cameraId: string },
): Promise<CameraPreference> {
  assertNativeCameraControl();
  try {
    return await invoke<CameraPreference>(command, args);
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}

async function invokeCameraMutation(
  command: string,
  cameraId: string,
  value: number,
): Promise<Camera> {
  if (!Number.isFinite(value)) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.InvalidArgument,
      message: "Camera control value must be finite.",
    });
  }
  assertNativeCameraControl();
  try {
    return await invoke<Camera>(command, { cameraId, value });
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}

function assertNativeCameraControl(): void {
  if (!isTauri()) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.Unavailable,
      message: "Native camera control is unavailable.",
    });
  }
}
