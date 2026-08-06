import type { DeviceEventCategory } from "@/lib/enums/device-event-category";
import type { DeviceEventChange } from "@/lib/enums/device-event-change";

export interface DeviceEvent {
  id: string;
  category: DeviceEventCategory;
  change: DeviceEventChange;
  occurredAt: string;
}

export type DeviceEventListener = (event: DeviceEvent) => void;
