import type { PermissionCategory } from "@/lib/enums/permission-category";
import type { Permission } from "@/lib/types/permission";
import type { PermissionSummaryProps } from "../types";

export interface PermissionRowProps {
  messages: PermissionSummaryProps["messages"];
  onReview: (category: PermissionCategory) => Promise<void>;
  permission: Permission;
  reviewingCategory: PermissionCategory | null;
}
