import { AudioDeviceCard } from "../audio-device-card";
import type { AudioDeviceSectionProps } from "./types";
import { Panel } from "@/components/panel";

export function AudioDeviceSection({
  description,
  devices,
  messages,
  onMakeDefault,
  onToggleMute,
  onVolumeChange,
  title,
}: AudioDeviceSectionProps): React.ReactNode {
  return (
    <Panel className="overflow-hidden">
      <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </header>
      <ul className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
        {devices.map((device) => (
          <AudioDeviceCard
            device={device}
            key={device.id}
            messages={messages}
            onMakeDefault={onMakeDefault}
            onToggleMute={onToggleMute}
            onVolumeChange={onVolumeChange}
          />
        ))}
      </ul>
    </Panel>
  );
}
