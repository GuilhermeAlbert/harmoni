import type { AudioDiscoveryState } from "@/lib/enums/audio-discovery-state";
import type { AudioDevice } from "@/lib/types/audio-device";

export interface AudioDevicesContextValue {
  devices: readonly AudioDevice[];
  refresh: () => void;
  refreshing: boolean;
  state: AudioDiscoveryState;
}
