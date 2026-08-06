import { PermissionCategory } from "@/lib/enums/permission-category";
import { PermissionStatus } from "@/lib/enums/permission-status";
import type { Permission } from "@/lib/types/permission";

export const PERMISSION_FIXTURES = [
  {
    category: PermissionCategory.Camera,
    id: "camera-permission",
    status: PermissionStatus.Authorized,
  },
  {
    category: PermissionCategory.Microphone,
    id: "microphone-permission",
    status: PermissionStatus.Denied,
  },
  {
    category: PermissionCategory.Accessibility,
    id: "accessibility-permission",
    status: PermissionStatus.NotDetermined,
  },
  {
    category: PermissionCategory.InputMonitoring,
    id: "input-monitoring-permission",
    status: PermissionStatus.Unsupported,
  },
] as const satisfies readonly Permission[];
