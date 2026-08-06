import {
  AudioLines,
  Camera,
  Keyboard,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

import { DashboardPath } from "@/lib/enums/dashboard-path";
import type { DashboardRoute } from "@/lib/types/dashboard-route";

export const DASHBOARD_ROUTES: readonly DashboardRoute[] = [
  {
    icon: LayoutDashboard,
    messageKey: "overview",
    path: DashboardPath.Overview,
  },
  {
    icon: AudioLines,
    messageKey: "audio",
    path: DashboardPath.Audio,
  },
  {
    icon: Camera,
    messageKey: "cameras",
    path: DashboardPath.Cameras,
  },
  {
    icon: Keyboard,
    messageKey: "peripherals",
    path: DashboardPath.Peripherals,
  },
  {
    icon: SlidersHorizontal,
    messageKey: "profiles",
    path: DashboardPath.Profiles,
  },
  {
    icon: Settings,
    messageKey: "settings",
    path: DashboardPath.Settings,
  },
];
