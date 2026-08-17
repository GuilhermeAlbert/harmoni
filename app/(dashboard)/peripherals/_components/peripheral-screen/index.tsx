"use client";

import { AlertTriangle, RefreshCw, Unplug } from "lucide-react";

import { PeripheralList } from "../peripheral-list";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { useLanguage } from "@/contexts/language/use-language";
import { usePeripherals } from "@/contexts/peripherals/use-peripherals";
import { InputMonitoringStatus } from "@/lib/enums/input-monitoring-status";
import { PeripheralDiscoveryState } from "@/lib/enums/peripheral-discovery-state";

export function PeripheralScreen(): React.ReactNode {
  const { inputMonitoring, peripherals, refresh, refreshing, state } =
    usePeripherals();
  const { messages } = useLanguage();
  const peripheralMessages = messages.peripherals;
  const hasError =
    state === PeripheralDiscoveryState.Error ||
    state === PeripheralDiscoveryState.Degraded;
  const canShowPeripherals =
    state === PeripheralDiscoveryState.Ready ||
    state === PeripheralDiscoveryState.Degraded;

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Success}>
              {peripheralMessages.realDataLabel}
            </Badge>
            <p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {peripheralMessages.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {peripheralMessages.title}
            </h2>
            <p className="mt-3 text-sm text-zinc-500">
              {peripheralMessages.description}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              {peripheralMessages.inputMonitoring}:{" "}
              {inputMonitoring === InputMonitoringStatus.Authorized
                ? peripheralMessages.inputMonitoringAuthorized
                : peripheralMessages.inputMonitoringGuidance}
            </p>
          </div>
          <Button
            disabled={refreshing || state === PeripheralDiscoveryState.Loading}
            onClick={refresh}
            variant={ButtonVariant.Secondary}
          >
            <RefreshCw
              aria-hidden="true"
              className={`size-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
            />
            {refreshing
              ? peripheralMessages.refreshing
              : peripheralMessages.refresh}
          </Button>
        </div>

        <p className="mt-4 text-xs leading-5 text-zinc-500">
          {peripheralMessages.lightingLimitation}
        </p>
        <p
          aria-live="polite"
          className="mt-5 min-h-5 text-sm"
          role="status"
        >
          {refreshing ? peripheralMessages.refreshing : ""}
        </p>

        {state === PeripheralDiscoveryState.Loading ? (
          <Panel className="mt-4 grid min-h-80 place-items-center">
            <Spinner label={peripheralMessages.loading} />
          </Panel>
        ) : null}

        {state === PeripheralDiscoveryState.Ready && !peripherals.length ? (
          <Panel className="mt-4">
            <EmptyState
              description={peripheralMessages.emptyDescription}
              icon={Unplug}
              title={peripheralMessages.emptyTitle}
            />
          </Panel>
        ) : null}

        {hasError ? (
          <Panel className="mt-4" role="alert">
            <EmptyState
              action={
                <Button onClick={refresh} size={ButtonSize.Small}>
                  {peripheralMessages.retry}
                </Button>
              }
              description={peripheralMessages.errorDescription}
              icon={AlertTriangle}
              title={peripheralMessages.errorTitle}
            />
          </Panel>
        ) : null}

        {canShowPeripherals && peripherals.length ? (
          <div className="mt-4">
            <PeripheralList
              messages={peripheralMessages}
              peripherals={peripherals}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
