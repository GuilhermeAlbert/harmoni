import type { Messages } from "@/lib/types/messages";
import type { Peripheral } from "@/lib/types/peripheral";

export interface PeripheralRowProps {
  messages: Messages["peripherals"];
  peripheral: Peripheral;
}
