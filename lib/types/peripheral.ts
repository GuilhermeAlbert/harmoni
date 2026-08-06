import type { PeripheralCategory } from "@/lib/enums/peripheral-category";
import type { PeripheralConnection } from "@/lib/enums/peripheral-connection";
import type { PeripheralTransport } from "@/lib/enums/peripheral-transport";

export interface Peripheral {
  readonly batteryPercent?: number;
  readonly canDisable: boolean;
  readonly category: PeripheralCategory;
  readonly connection: PeripheralConnection;
  readonly enabled: boolean;
  readonly id: string;
  readonly manufacturer: string;
  readonly name: string;
  readonly transport: PeripheralTransport;
}
