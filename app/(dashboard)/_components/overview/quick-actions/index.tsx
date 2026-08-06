import { ChevronRight, VideoOff, Waves } from "lucide-react";

import type { QuickActionsProps } from "./types";
import { Panel } from "@/components/panel";

export function QuickActions({
  messages,
  onDisableCameras,
  onSelectRecordingProfile,
}: QuickActionsProps): React.ReactNode {
  const actions = [
    {
      description: messages.disableCamerasHint,
      icon: VideoOff,
      label: messages.disableCameras,
      onClick: onDisableCameras,
    },
    {
      description: messages.recordingProfileHint,
      icon: Waves,
      label: messages.recordingProfile,
      onClick: onSelectRecordingProfile,
    },
  ];

  return (
    <Panel className="overflow-hidden">
      <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
        <h2 className="text-sm font-semibold">{messages.title}</h2>
        <p className="mt-1 text-xs text-zinc-500">{messages.description}</p>
      </header>
      <div className="space-y-2 p-4">
        {actions.map(({ description, icon: Icon, label, onClick }) => (
          <button
            className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition-colors hover:bg-zinc-100 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:bg-white/[0.06] dark:focus-visible:outline-white"
            key={label}
            onClick={onClick}
            type="button"
          >
            <Icon aria-hidden="true" className="size-4 shrink-0 text-zinc-500" />
            <span className="min-w-0 flex-1">
              <strong className="block text-xs font-medium">{label}</strong>
              <span className="mt-1 block text-[0.6875rem] leading-4 text-zinc-500">
                {description}
              </span>
            </span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-zinc-400" />
          </button>
        ))}
      </div>
    </Panel>
  );
}
