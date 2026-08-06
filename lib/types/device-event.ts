import type { DeviceCategory } from "@/lib/enums/device-category";
import type { DeviceEventChange } from "@/lib/enums/device-event-change";

export interface DeviceEvent {
  id: string;
  category: DeviceCategory;
  change: DeviceEventChange;
  occurredAt: string;
}

export type DeviceEventListener = (event: DeviceEvent) => void;
