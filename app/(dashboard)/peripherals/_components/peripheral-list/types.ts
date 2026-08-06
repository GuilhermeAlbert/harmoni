import type { Messages } from "@/lib/types/messages";
import type { Peripheral } from "@/lib/types/peripheral";

export interface PeripheralListProps {
  messages: Messages["peripherals"];
  onToggle: (peripheralId: string, enabled: boolean) => void;
  peripherals: readonly Peripheral[];
}
