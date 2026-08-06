import type { CameraAuthorization } from "@/lib/enums/camera-authorization";
import type { CameraDiscoveryState } from "@/lib/enums/camera-discovery-state";
import type { Camera } from "@/lib/types/camera";
import type { CameraAction } from "@/lib/enums/camera-action";
import type { CameraMutationStatus } from "@/lib/enums/camera-mutation-status";

export interface CamerasContextValue {
  authorization: CameraAuthorization | null;
  cameras: readonly Camera[];
  mutation: CameraMutation | null;
  pending: CameraPendingAction | null;
  preferredCameraId: string | null;
  refresh: () => void;
  refreshing: boolean;
  state: CameraDiscoveryState;
  resetPreferred: () => Promise<void>;
  setExposure: (camera: Camera, value: number) => Promise<void>;
  setPreferred: (camera: Camera) => Promise<void>;
  setZoom: (camera: Camera, value: number) => Promise<void>;
}

export interface CameraPendingAction {
  action: CameraAction;
  cameraId: string | null;
}

export interface CameraMutation extends CameraPendingAction {
  status: CameraMutationStatus;
}
