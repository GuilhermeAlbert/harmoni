import type { CameraControlsProps } from "./types";
import { Panel } from "@/components/panel";
import { Slider } from "@/components/slider";
import { CameraAction } from "@/lib/enums/camera-action";

export function CameraControls({
  camera,
  messages,
  onExposureChange,
  onZoomChange,
  pending,
}: CameraControlsProps): React.ReactNode {
  const controls = [
    { action: CameraAction.Zoom, capability: camera.zoom, label: messages.zoom, onChange: onZoomChange },
    { action: CameraAction.Exposure, capability: camera.exposure, label: messages.exposure, onChange: onExposureChange },
  ].filter(({ capability }) => capability?.canControl === true);

  return (
    <Panel className="p-5">
      <h2 className="text-sm font-semibold">{messages.controlsTitle}</h2>
      <p className="mt-1 text-xs text-zinc-500">{messages.controlsDescription}</p>
      {controls.length === 0 ? (
        <p className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-5 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-zinc-400">
          {messages.controlsUnsupportedMacOS}
        </p>
      ) : null}
      <div className="mt-5 grid gap-6">
        {controls.map(({ action, capability, label, onChange }) => {
          const controlPending = pending?.action === action && pending.cameraId === camera.id;
          const supported = capability?.canControl === true;
          return (
            <div key={action}>
              <Slider
                disabled={pending !== null || !supported}
                label={label}
                max={capability?.max ?? 1}
                min={capability?.min ?? 0}
                name={`${camera.id}-${action}`}
                onChange={(event) => void onChange(camera, Number(event.target.value))}
                step={0.1}
                value={capability?.value ?? 0}
                valueText={capability ? capability.value.toFixed(1) : undefined}
              />
              <p className="mt-2 text-xs text-zinc-500">
                {controlPending
                  ? messages.applyingControl
                  : supported
                    ? messages.controlSupported
                    : messages.unsupported}
              </p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
