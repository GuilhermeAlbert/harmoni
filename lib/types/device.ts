import type { DeviceAvailabilityStatus } from "@/lib/enums/device-availability-status";
import type { DeviceCategory } from "@/lib/enums/device-category";
import type { DeviceConnectionStatus } from "@/lib/enums/device-connection-status";

export interface Device {
  readonly active: boolean;
  readonly availability: DeviceAvailabilityStatus;
  readonly batteryPercent?: number;
  readonly cameraResolution?: string;
  readonly cameraZoom?: number;
  readonly category: DeviceCategory;
  readonly connection: DeviceConnectionStatus;
  readonly default: boolean;
  readonly enabled: boolean;
  readonly id: string;
  readonly muted?: boolean;
  readonly name: string;
  readonly transport: string;
  readonly volumePercent?: number;
}
