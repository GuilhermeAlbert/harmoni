"use client";
import { Camera, Headphones, Keyboard, Mic2, RefreshCw } from "lucide-react";
import { MetricCard } from "./metric-card";
import { Badge } from "@/components/badge"; import { BadgeTone } from "@/components/badge/enums"; import { Button } from "@/components/button"; import { ButtonVariant } from "@/components/button/enums";
import { useAudioDevices } from "@/contexts/audio-devices/use-audio-devices"; import { useCameras } from "@/contexts/cameras/use-cameras"; import { usePeripherals } from "@/contexts/peripherals/use-peripherals"; import { useLanguage } from "@/contexts/language/use-language";
import { AudioDirection } from "@/lib/enums/audio-direction";

export function Overview(): React.ReactNode {
  const audio = useAudioDevices(); const cameras = useCameras(); const peripherals = usePeripherals(); const { messages } = useLanguage(); const m = messages.overview;
  const input = audio.devices.find(device => device.direction === AudioDirection.Input && device.isDefault) ?? audio.devices.find(device => device.direction === AudioDirection.Input);
  const output = audio.devices.find(device => device.direction === AudioDirection.Output && device.isDefault) ?? audio.devices.find(device => device.direction === AudioDirection.Output);
  const camera = cameras.cameras.find(device => device.preferred) ?? cameras.cameras[0]; const format = camera?.formats[0];
  const refreshing = audio.refreshing || cameras.refreshing || peripherals.refreshing;
  const refresh = () => { audio.refresh(); cameras.refresh(); peripherals.refresh(); };
  return <main className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end"><div className="max-w-3xl"><Badge tone={BadgeTone.Success}>{m.fixtureLabel}</Badge><p className="mt-4 text-xs uppercase tracking-wider text-zinc-500">{m.eyebrow}</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl">{m.title}</h2><p className="mt-4 text-sm text-zinc-500">{m.description}</p></div><Button disabled={refreshing} onClick={refresh} variant={ButtonVariant.Secondary}><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? m.refreshing : m.refresh}</Button></div>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard description={input?.volume == null ? m.metrics.unavailableReading : `${input.volume}% ${m.metrics.volume}`} icon={Mic2} title={m.metrics.audioInput} value={input?.name ?? m.metrics.noActiveDevice} />
      <MetricCard description={output?.volume == null ? m.metrics.unavailableReading : `${output.volume}% ${m.metrics.volume}`} icon={Headphones} title={m.metrics.audioOutput} value={output?.name ?? m.metrics.noActiveDevice} />
      <MetricCard description={format ? `${format.width} × ${format.height} · ${format.frameRate.toFixed(0)} fps` : m.metrics.unavailableReading} icon={Camera} title={m.metrics.camera} value={camera?.name ?? m.metrics.noActiveDevice} />
      <MetricCard description={peripherals.inputMonitoring === "authorized" ? m.metrics.allResponding : messages.peripherals.inputMonitoringGuidance} icon={Keyboard} title={m.metrics.peripherals} value={`${peripherals.peripherals.length} ${m.metrics.connected}`} />
    </div>
  </div></main>;
}
