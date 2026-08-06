import type { AudioDirection } from "@/lib/enums/audio-direction";
import type { AudioTransport } from "@/lib/enums/audio-transport";

export interface AudioDevice {
  readonly canReadMute: boolean;
  readonly canReadVolume: boolean;
  readonly direction: AudioDirection;
  readonly id: string;
  readonly isDefault: boolean;
  readonly muted: boolean | null;
  readonly name: string;
  readonly transport: AudioTransport;
  readonly uid: string;
  readonly volume: number | null;
}
