import { DeviceAvailabilityStatus } from "@/lib/enums/device-availability-status";
import { DeviceCategory } from "@/lib/enums/device-category";
import { DeviceConnectionStatus } from "@/lib/enums/device-connection-status";
import type { Device } from "@/lib/types/device";

export const DEVICE_FIXTURES = [
  {
    active: false,
    availability: DeviceAvailabilityStatus.Available,
    batteryPercent: 82,
    category: DeviceCategory.Keyboard,
    connection: DeviceConnectionStatus.Connected,
    default: false,
    enabled: true,
    id: "mx-mechanical",
    name: "MX Mechanical",
    transport: "Bluetooth",
  },
  {
    active: false,
    availability: DeviceAvailabilityStatus.Available,
    batteryPercent: 68,
    category: DeviceCategory.Mouse,
    connection: DeviceConnectionStatus.Connected,
    default: false,
    enabled: true,
    id: "mx-master-3s",
    name: "MX Master 3S",
    transport: "Bluetooth",
  },
  {
    active: false,
    availability: DeviceAvailabilityStatus.Unsupported,
    batteryPercent: 91,
    category: DeviceCategory.Trackpad,
    connection: DeviceConnectionStatus.Connected,
    default: false,
    enabled: true,
    id: "magic-trackpad",
    name: "Magic Trackpad",
    transport: "Bluetooth",
  },
] as const satisfies readonly Device[];
