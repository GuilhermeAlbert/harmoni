import type { Camera } from "@/lib/types/camera";
import type { Messages } from "@/lib/types/messages";
import type { CameraPendingAction } from "@/contexts/cameras/types";

export interface CameraListProps {
  cameras: readonly Camera[];
  messages: Messages["cameras"];
  onSetPreferred: (camera: Camera) => Promise<void>;
  pending: CameraPendingAction | null;
}
