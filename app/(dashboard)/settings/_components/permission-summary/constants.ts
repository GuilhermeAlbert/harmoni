import { Accessibility, Camera, Keyboard, Mic2, type LucideIcon } from "lucide-react";

import { BadgeTone } from "@/components/badge/enums";
import { PermissionCategory } from "@/lib/enums/permission-category";
import { PermissionStatus } from "@/lib/enums/permission-status";
import type { PermissionSummaryProps } from "./types";

export const PERMISSION_ICONS: Record<PermissionCategory, LucideIcon> = {
  [PermissionCategory.Accessibility]: Accessibility,
  [PermissionCategory.Camera]: Camera,
  [PermissionCategory.InputMonitoring]: Keyboard,
  [PermissionCategory.Microphone]: Mic2,
};

export const PERMISSION_CATEGORY_MESSAGE_KEYS: Record<
  PermissionCategory,
  keyof PermissionSummaryProps["messages"]["categories"]
> = {
  [PermissionCategory.Accessibility]: "accessibility",
  [PermissionCategory.Camera]: "camera",
  [PermissionCategory.InputMonitoring]: "inputMonitoring",
  [PermissionCategory.Microphone]: "microphone",
};

export const PERMISSION_STATUS_MESSAGE_KEYS: Record<
  PermissionStatus,
  keyof PermissionSummaryProps["messages"]["statuses"]
> = {
  [PermissionStatus.Authorized]: "authorized",
  [PermissionStatus.Denied]: "denied",
  [PermissionStatus.NotGranted]: "notGranted",
  [PermissionStatus.NotDetermined]: "notDetermined",
  [PermissionStatus.Restricted]: "restricted",
  [PermissionStatus.Unsupported]: "unsupported",
  [PermissionStatus.Unknown]: "unknown",
};

export const PERMISSION_STATUS_TONES: Record<PermissionStatus, BadgeTone> = {
  [PermissionStatus.Authorized]: BadgeTone.Success,
  [PermissionStatus.Denied]: BadgeTone.Danger,
  [PermissionStatus.NotGranted]: BadgeTone.Warning,
  [PermissionStatus.NotDetermined]: BadgeTone.Warning,
  [PermissionStatus.Restricted]: BadgeTone.Danger,
  [PermissionStatus.Unsupported]: BadgeTone.Neutral,
  [PermissionStatus.Unknown]: BadgeTone.Neutral,
};
