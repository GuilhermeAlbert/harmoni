import type { PeripheralCategory } from "@/lib/enums/peripheral-category";
import type { PeripheralTransport } from "@/lib/enums/peripheral-transport";

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
  readonly inputMonitoring: string;
  readonly peripherals: readonly Peripheral[];
}
