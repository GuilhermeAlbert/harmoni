import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}

