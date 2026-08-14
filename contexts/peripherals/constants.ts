import { DeviceEventCategory } from "@/lib/enums/device-event-category";

export const PERIPHERAL_EVENT_CATEGORIES: readonly DeviceEventCategory[] = [
  DeviceEventCategory.Peripheral,
  DeviceEventCategory.Keyboard,
  DeviceEventCategory.Mouse,
  DeviceEventCategory.Trackpad,
];

export const PERIPHERAL_REFRESH_DEBOUNCE_MILLISECONDS = 150;
