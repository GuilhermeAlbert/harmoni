import type { Device } from "@/lib/types/device";
import type { Messages } from "@/lib/types/messages";

export interface DevicePanelProps {
  devices: readonly Device[];
  messages: Messages["overview"]["devices"];
  onToggleDevice: (deviceId: string, enabled: boolean) => void;
}
