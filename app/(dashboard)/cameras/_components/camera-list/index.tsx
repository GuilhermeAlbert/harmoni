import { Camera as CameraIcon } from "lucide-react";

import type { CameraListProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { Panel } from "@/components/panel";
import { CameraStatus } from "@/lib/enums/camera-status";

export function CameraList({
  cameras,
  messages,
  onMakePreferred,
}: CameraListProps): React.ReactNode {
  return (
    <Panel className="overflow-hidden">
      <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
        <h2 className="text-sm font-semibold">{messages.listTitle}</h2>
        <p className="mt-1 text-xs text-zinc-500">{messages.listDescription}</p>
      </header>
      <ul className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
        {cameras.map((camera) => {
          const available = camera.status === CameraStatus.Available;

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
                      {camera.transport} · {camera.format.width} × {camera.format.height} · {camera.format.frameRate} {messages.framesPerSecond}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge
                    tone={available ? BadgeTone.Neutral : BadgeTone.Danger}
                  >
                    {available ? messages.available : messages.unavailable}
                  </Badge>
                  {camera.preferred ? (
                    <Badge tone={BadgeTone.Success}>{messages.preferred}</Badge>
                  ) : (
                    <Button
                      disabled={!available}
                      onClick={() => onMakePreferred(camera.id)}
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Secondary}
                    >
                      {messages.makePreferred}
                    </Button>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
