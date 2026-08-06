import type { Camera } from "@/lib/types/camera";
import type { Messages } from "@/lib/types/messages";

export interface CameraPreviewProps {
  camera: Camera;
  messages: Messages["cameras"];
}
