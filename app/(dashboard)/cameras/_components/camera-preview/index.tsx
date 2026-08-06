import { Camera as CameraIcon } from "lucide-react";

import type { CameraPreviewProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Panel } from "@/components/panel";

export function CameraPreview({
  camera,
  messages,
}: CameraPreviewProps): React.ReactNode {
  const format = camera.formats[0];
  return (
    <Panel className="overflow-hidden p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{messages.previewTitle}</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {messages.previewDescription}
          </p>
        </div>
        <Badge tone={BadgeTone.Warning}>{messages.simulatedPreview}</Badge>
      </div>

      <div
        aria-label={`${messages.simulatedPreview}: ${camera.name}`}
        className="mt-5 grid aspect-video place-items-center rounded-2xl border border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-white/[0.08] dark:bg-zinc-950 dark:text-zinc-500"
        role="img"
      >
        <div className="grid justify-items-center gap-3 text-center">
          <span className="grid size-14 place-items-center rounded-2xl border border-zinc-300 bg-white dark:border-white/10 dark:bg-white/5">
            <CameraIcon aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {camera.name}
            </p>
            <p className="mt-1 font-[family-name:var(--font-commit-mono)] text-xs">
              {format
                ? `${format.width} × ${format.height} · ${format.frameRate.toFixed(0)} ${messages.framesPerSecond}`
                : messages.noFormats}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {messages.previewNotStarted}
      </p>
    </Panel>
  );
}
