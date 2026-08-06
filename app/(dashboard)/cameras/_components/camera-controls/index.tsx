import type { CameraControlsProps } from "./types";
import { Panel } from "@/components/panel";

export function CameraControls({
  camera,
  messages,
}: CameraControlsProps): React.ReactNode {
  const capabilities = [
    { capability: camera.zoom, label: messages.zoom },
    { capability: camera.exposure, label: messages.exposure },
  ];

  return (
    <Panel className="p-5">
      <h2 className="text-sm font-semibold">{messages.controlsTitle}</h2>
      <p className="mt-1 text-xs text-zinc-500">
        {messages.controlsDescription}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {capabilities.map(({ capability, label }) => (
          <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/[0.08]" key={label}>
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-sm font-medium">
              {capability
                ? `${capability.min.toFixed(1)} – ${capability.max.toFixed(1)}`
                : messages.unsupported}
            </p>
            {capability ? (
              <p className="mt-1 text-xs text-zinc-500">
                {messages.currentValue}: {capability.value.toFixed(1)} · {capability.canControl ? messages.controlSupported : messages.readOnlyCapability}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
