import type { Messages } from "@/lib/types/messages";
import type { Peripheral } from "@/lib/types/peripheral";

export interface PeripheralRowProps {
  messages: Messages["peripherals"];
  onToggle: (peripheralId: string, enabled: boolean) => void;
  peripheral: Peripheral;
}
