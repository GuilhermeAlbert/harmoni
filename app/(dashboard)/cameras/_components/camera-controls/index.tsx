import type { CameraControlsProps } from "./types";
import { Panel } from "@/components/panel";
import { Slider } from "@/components/slider";
import { CameraStatus } from "@/lib/enums/camera-status";

export function CameraControls({
  camera,
  messages,
  onExposureChange,
  onZoomChange,
}: CameraControlsProps): React.ReactNode {
  const available = camera.status === CameraStatus.Available;
  const zoomCapability = camera.capabilities.zoom;
  const exposureCapability = camera.capabilities.exposure;
  const zoomDisabled = !available || !zoomCapability;
  const exposureDisabled = !available || !exposureCapability;
  const disabledReason = available
    ? messages.unsupported
    : messages.unavailableReason;

  return (
    <Panel className="p-5">
      <h2 className="text-sm font-semibold">{messages.controlsTitle}</h2>
      <p className="mt-1 text-xs text-zinc-500">
        {messages.controlsDescription}
      </p>

      <div className="mt-7">
        <Slider
          disabled={zoomDisabled}
          label={messages.zoom}
          max={zoomCapability?.max ?? 1}
          min={zoomCapability?.min ?? 0}
          name={`${camera.id}-zoom`}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          step={zoomCapability?.step ?? 1}
          value={zoomCapability ? camera.zoom : 0}
          valueText={zoomCapability ? `${camera.zoom.toFixed(2)}×` : undefined}
        />
        {zoomDisabled ? (
          <p className="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-200">
            {disabledReason}
          </p>
        ) : null}
      </div>

      <div className="mt-7">
        <Slider
          disabled={exposureDisabled}
          label={messages.exposure}
          max={exposureCapability?.max ?? 1}
          min={exposureCapability?.min ?? 0}
          name={`${camera.id}-exposure`}
          onChange={(event) => onExposureChange(Number(event.target.value))}
          step={exposureCapability?.step ?? 1}
          value={exposureCapability ? camera.exposure : 0}
          valueText={
            exposureCapability
              ? camera.exposure.toFixed(1)
              : undefined
          }
        />
        {exposureDisabled ? (
          <p className="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-200">
            {disabledReason}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
