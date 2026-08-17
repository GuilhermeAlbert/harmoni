import { AudioDiscoveryState } from "@/lib/enums/audio-discovery-state";

export function getAudioFailureState(deviceCount: number): AudioDiscoveryState {
  return deviceCount > 0 ? AudioDiscoveryState.Degraded : AudioDiscoveryState.Error;
}
