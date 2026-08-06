import type { Messages } from "@/lib/types/messages";
import type { Peripheral } from "@/lib/types/peripheral";

export interface PeripheralListProps {
  messages: Messages["peripherals"];
  peripherals: readonly Peripheral[];
}
