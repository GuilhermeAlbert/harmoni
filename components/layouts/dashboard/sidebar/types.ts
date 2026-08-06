import type { Messages } from "@/lib/types/messages";

export interface DashboardSidebarProps {
  className?: string;
  messages: Messages;
  onClose?: () => void;
  onNavigate?: () => void;
  pathname: string;
}

