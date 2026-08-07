"use client";
import { AlertTriangle, RefreshCw, Unplug } from "lucide-react";
import { PeripheralList } from "../peripheral-list";
import { Badge } from "@/components/badge"; import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button"; import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state"; import { Panel } from "@/components/panel"; import { Spinner } from "@/components/spinner";
import { useLanguage } from "@/contexts/language/use-language"; import { usePeripherals } from "@/contexts/peripherals/use-peripherals";
import { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";

export function PeripheralScreen(): React.ReactNode {
  const { inputMonitoring, peripherals, refresh, refreshing, state } = usePeripherals(); const { messages } = useLanguage(); const m = messages.peripherals;
  return <main className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end"><div className="max-w-3xl"><Badge tone={BadgeTone.Success}>{m.realDataLabel}</Badge><p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">{m.eyebrow}</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{m.title}</h2><p className="mt-3 text-sm text-zinc-500">{m.description}</p><p className="mt-3 text-xs text-zinc-500">{m.inputMonitoring}: {inputMonitoring === "authorized" ? m.inputMonitoringAuthorized : m.inputMonitoringGuidance}</p></div>
    <Button disabled={refreshing || state === PeripheralDiscoveryState.Loading} onClick={refresh} variant={ButtonVariant.Secondary}><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? m.refreshing : m.refresh}</Button></div>
    <p className="mt-4 text-xs leading-5 text-zinc-500">{m.lightingLimitation}</p>
    <p aria-live="polite" className="mt-5 min-h-5 text-sm" role="status">{refreshing ? m.refreshing : ""}</p>
    {state === PeripheralDiscoveryState.Loading ? <Panel className="mt-4 grid min-h-80 place-items-center"><Spinner label={m.loading} /></Panel> : null}
    {state === PeripheralDiscoveryState.Ready && !peripherals.length ? <Panel className="mt-4"><EmptyState description={m.emptyDescription} icon={Unplug} title={m.emptyTitle} /></Panel> : null}
    {state === PeripheralDiscoveryState.Error || state === PeripheralDiscoveryState.Degraded ? <Panel className="mt-4" role="alert"><EmptyState action={<Button onClick={refresh} size={ButtonSize.Small}>{m.retry}</Button>} description={m.errorDescription} icon={AlertTriangle} title={m.errorTitle} /></Panel> : null}
    {(state === PeripheralDiscoveryState.Ready || state === PeripheralDiscoveryState.Degraded) && peripherals.length ? <div className="mt-4"><PeripheralList messages={m} peripherals={peripherals} /></div> : null}
  </div></main>;
}
