import type { CameraAuthorization } from "@/lib/enums/camera-authorization";
import type { CameraDiscoveryState } from "@/lib/enums/camera-discovery-state";
import type { Camera } from "@/lib/types/camera";

export interface CamerasContextValue {
  authorization: CameraAuthorization | null;
  cameras: readonly Camera[];
  refresh: () => void;
  refreshing: boolean;
  state: CameraDiscoveryState;
}
