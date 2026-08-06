import type { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";
import type { Peripheral } from "@/lib/types/peripheral";
export interface PeripheralsContextValue { inputMonitoring: string | null; peripherals: readonly Peripheral[]; refresh: () => void; refreshing: boolean; state: PeripheralDiscoveryState }
