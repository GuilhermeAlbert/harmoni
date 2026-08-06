import type { Camera } from "@/lib/types/camera";
import type { Messages } from "@/lib/types/messages";
import type { CameraPendingAction } from "@/contexts/cameras/types";

export interface CameraControlsProps {
  camera: Camera;
  messages: Messages["cameras"];
  onExposureChange: (camera: Camera, value: number) => Promise<void>;
  onZoomChange: (camera: Camera, value: number) => Promise<void>;
  pending: CameraPendingAction | null;
}
