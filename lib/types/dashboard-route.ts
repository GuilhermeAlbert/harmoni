import type { LucideIcon } from "lucide-react";

import type { DashboardPath } from "@/lib/enums/dashboard-path";
import type { Messages } from "@/lib/types/messages";

export interface DashboardRoute {
  icon: LucideIcon;
  messageKey: keyof Messages["routes"];
  path: DashboardPath;
}
