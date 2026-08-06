import { Camera as CameraIcon } from "lucide-react";

import type { CameraListProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Panel } from "@/components/panel";
import { CameraTransport } from "@/lib/enums/camera-transport";

const TRANSPORT_KEYS = {
  [CameraTransport.BuiltIn]: "builtIn",
  [CameraTransport.Continuity]: "continuity",
  [CameraTransport.External]: "external",
  [CameraTransport.Unknown]: "unknown",
} as const;

export function CameraList({
  cameras,
  messages,
}: CameraListProps): React.ReactNode {
  return (
    <Panel className="overflow-hidden">
      <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
        <h2 className="text-sm font-semibold">{messages.listTitle}</h2>
        <p className="mt-1 text-xs text-zinc-500">{messages.listDescription}</p>
      </header>
      <ul className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
        {cameras.map((camera) => {
          const format = camera.formats[0];
          return (
            <li className="p-4 sm:p-5" key={camera.id}>
              <article className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                    <CameraIcon aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {camera.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {messages.transports[TRANSPORT_KEYS[camera.transport]]}
                      {format ? ` · ${format.width} × ${format.height} · ${format.frameRate.toFixed(0)} ${messages.framesPerSecond}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={BadgeTone.Neutral}>
                    {camera.formats.length} {messages.formats}
                  </Badge>
                  {camera.preferred ? (
                    <Badge tone={BadgeTone.Success}>{messages.preferred}</Badge>
                  ) : null}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
