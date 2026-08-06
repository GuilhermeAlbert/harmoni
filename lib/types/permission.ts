import type { PermissionCategory } from "@/lib/enums/permission-category";
import type { PermissionStatus } from "@/lib/enums/permission-status";

export interface Permission {
  readonly category: PermissionCategory;
  readonly id: string;
  readonly status: PermissionStatus;
}
