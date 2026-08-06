import type { Camera } from "@/lib/types/camera";
import type { Messages } from "@/lib/types/messages";

export interface CameraControlsProps {
  camera: Camera;
  messages: Messages["cameras"];
}
