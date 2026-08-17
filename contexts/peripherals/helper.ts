import { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";

export function getPeripheralFailureState(peripheralCount: number): PeripheralDiscoveryState {
  return peripheralCount > 0
    ? PeripheralDiscoveryState.Degraded
    : PeripheralDiscoveryState.Error;
}
