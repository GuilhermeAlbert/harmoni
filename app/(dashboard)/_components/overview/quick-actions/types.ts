import type { Messages } from "@/lib/types/messages";

export interface QuickActionsProps {
  messages: Messages["overview"]["quickActions"];
  onDisableCameras: () => void;
  onSelectRecordingProfile: () => void;
}
