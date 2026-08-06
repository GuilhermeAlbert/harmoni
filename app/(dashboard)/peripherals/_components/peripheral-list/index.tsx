import { PeripheralRow } from "../peripheral-row";
import type { PeripheralListProps } from "./types";
import { Panel } from "@/components/panel";

export function PeripheralList({
  messages,
  peripherals,
}: PeripheralListProps): React.ReactNode {
  return (
    <Panel className="overflow-hidden">
      <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
        <h2 className="text-sm font-semibold">{messages.listTitle}</h2>
        <p className="mt-1 text-xs text-zinc-500">{messages.listDescription}</p>
      </header>
      <ul className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
        {peripherals.map((peripheral) => (
          <PeripheralRow
            key={peripheral.id}
            messages={messages}
            peripheral={peripheral}
          />
        ))}
      </ul>
    </Panel>
  );
}
