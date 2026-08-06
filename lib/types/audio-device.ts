import type { AudioDeviceStatus } from "@/lib/enums/audio-device-status";
import type { AudioDirection } from "@/lib/enums/audio-direction";
import type { AudioTransport } from "@/lib/enums/audio-transport";

export interface AudioDevice {
  readonly default: boolean;
  readonly direction: AudioDirection;
  readonly id: string;
  readonly muted: boolean;
  readonly name: string;
  readonly status: AudioDeviceStatus;
  readonly transport: AudioTransport;
  readonly volume: number;
}
