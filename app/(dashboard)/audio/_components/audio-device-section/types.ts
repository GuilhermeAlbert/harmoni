import type { AudioDevice } from "@/lib/types/audio-device";
import type { Messages } from "@/lib/types/messages";
import type { AudioPendingMutation } from "@/contexts/audio-devices/types";

export interface AudioDeviceSectionProps {
  description: string;
  devices: readonly AudioDevice[];
  messages: Messages["audio"];
  onSetDefault: (device: AudioDevice) => Promise<void>;
  onSetMute: (device: AudioDevice, muted: boolean) => Promise<void>;
  onSetVolume: (device: AudioDevice, volume: number) => Promise<void>;
  pending: AudioPendingMutation | null;
  title: string;
}
