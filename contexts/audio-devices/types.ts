import type { AudioDiscoveryState } from "@/lib/enums/audio-discovery-state";
import type { AudioControl } from "@/lib/enums/audio-control";
import type { AudioMutationStatus } from "@/lib/enums/audio-mutation-status";
import type { AudioDevice } from "@/lib/types/audio-device";

export interface AudioDevicesContextValue {
  devices: readonly AudioDevice[];
  refresh: () => void;
  refreshing: boolean;
  state: AudioDiscoveryState;
  mutation: AudioMutationState | null;
  pending: AudioPendingMutation | null;
  setDefault: (device: AudioDevice) => Promise<void>;
  setMute: (device: AudioDevice, muted: boolean) => Promise<void>;
  setVolume: (device: AudioDevice, volume: number) => Promise<void>;
}

export interface AudioPendingMutation {
  control: AudioControl;
  deviceId: string;
}

export interface AudioMutationState extends AudioPendingMutation {
  message?: string;
  status: AudioMutationStatus;
}
