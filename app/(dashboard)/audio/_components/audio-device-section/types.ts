import type { AudioDevice } from "@/lib/types/audio-device";
import type { Messages } from "@/lib/types/messages";

export interface AudioDeviceSectionProps {
  description: string;
  devices: readonly AudioDevice[];
  messages: Messages["audio"];
  title: string;
}
