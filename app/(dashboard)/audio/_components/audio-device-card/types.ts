import type { AudioDevice } from "@/lib/types/audio-device";
import type { Messages } from "@/lib/types/messages";

export interface AudioDeviceCardProps {
  device: AudioDevice;
  messages: Messages["audio"];
}
