import type { Messages } from "@/lib/types/messages";

export interface DashboardNavigationProps {
  messages: Messages;
  onNavigate?: () => void;
  pathname: string;
}

