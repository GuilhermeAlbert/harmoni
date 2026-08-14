import { CameraDiscoveryState } from "@/lib/enums/camera-discovery-state";

export function getCameraFailureState(cameraCount: number): CameraDiscoveryState {
  return cameraCount > 0 ? CameraDiscoveryState.Degraded : CameraDiscoveryState.Error;
}
