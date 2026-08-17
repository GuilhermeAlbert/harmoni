import type { InputMonitoringStatus } from "@/lib/enums/input-monitoring-status";
import type { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";
import type { Peripheral } from "@/lib/types/peripheral";

export interface PeripheralsContextValue {
  inputMonitoring: InputMonitoringStatus | null;
  peripherals: readonly Peripheral[];
  refresh: () => void;
  refreshing: boolean;
  state: PeripheralDiscoveryState;
}
