import type { PeripheralCategory } from "@/lib/enums/peripheral-category";
import type { PeripheralTransport } from "@/lib/enums/peripheral-transport";
import type { InputMonitoringStatus } from "@/lib/enums/input-monitoring-status";

export interface Peripheral {
  readonly batteryPercent?: number;
  readonly category: PeripheralCategory;
  readonly id: string;
  readonly manufacturer: string;
  readonly name: string;
  readonly transport: PeripheralTransport;
  readonly productId: number | null;
  readonly vendorId: number | null;
}

export interface PeripheralDiscovery {
  readonly inputMonitoring: InputMonitoringStatus;
  readonly peripherals: readonly Peripheral[];
}
