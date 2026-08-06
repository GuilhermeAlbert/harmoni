import type { Camera } from "@/lib/types/camera";
import type { Messages } from "@/lib/types/messages";

export interface CameraListProps {
  cameras: readonly Camera[];
  messages: Messages["cameras"];
}
