"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { AlertTriangle, Unplug } from "lucide-react";

import { PeripheralList } from "../peripheral-list";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { useLanguage } from "@/contexts/language/use-language";
import { PERIPHERAL_FIXTURES } from "@/lib/constants/peripheral-fixtures";
import { PeripheralConnection } from "@/lib/enums/peripheral-connection";
import { PeripheralFixtureState } from "@/lib/enums/peripheral-fixture-state";
import type { Peripheral } from "@/lib/types/peripheral";

const PERIPHERAL_FIXTURE_STATES = [
  PeripheralFixtureState.Success,
  PeripheralFixtureState.Loading,
  PeripheralFixtureState.Empty,
  PeripheralFixtureState.Error,
] as const;

function copyPeripheralFixtures(): Peripheral[] {
  return PERIPHERAL_FIXTURES.map(
    (peripheral): Peripheral => ({ ...peripheral }),
  );
}

function isPeripheralFixtureState(
  value: string,
): value is PeripheralFixtureState {
  return PERIPHERAL_FIXTURE_STATES.some((state) => state === value);
}

export function PeripheralScreen(): React.ReactNode {
  const [feedback, setFeedback] = useState("");
  const [fixtureState, setFixtureState] = useState(
    PeripheralFixtureState.Success,
  );
  const [peripherals, setPeripherals] = useState<Peripheral[]>(
    copyPeripheralFixtures,
  );
  const { messages } = useLanguage();
  const peripheralMessages = messages.peripherals;

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    if (isPeripheralFixtureState(event.target.value)) {
      setFixtureState(event.target.value);
      setFeedback("");
    }
  };

  const handleToggle = (peripheralId: string, enabled: boolean): void => {
    const selectedPeripheral = peripherals.find(
      (peripheral) => peripheral.id === peripheralId,
    );

    if (
      !selectedPeripheral ||
      !selectedPeripheral.canDisable ||
      selectedPeripheral.connection !== PeripheralConnection.Connected
    ) {
      return;
    }

    setPeripherals((currentPeripherals) =>
      currentPeripherals.map((peripheral) =>
        peripheral.id === peripheralId
          ? { ...peripheral, enabled }
          : peripheral,
      ),
    );
    setFeedback(
      enabled
        ? peripheralMessages.feedback.enabled
        : peripheralMessages.feedback.disabled,
    );
  };

  const restoreSuccessState = (): void => {
    setPeripherals(copyPeripheralFixtures());
    setFixtureState(PeripheralFixtureState.Success);
    setFeedback("");
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Warning}>
              {peripheralMessages.fixtureLabel}
            </Badge>
            <p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {peripheralMessages.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-geist)] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-4xl">
              {peripheralMessages.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {peripheralMessages.description}
            </p>
          </div>

          <label className="grid min-w-52 gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {peripheralMessages.stateLabel}
            <select
              className="min-h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:outline-white"
              onChange={handleStateChange}
              value={fixtureState}
            >
              {PERIPHERAL_FIXTURE_STATES.map((state) => (
                <option key={state} value={state}>
                  {peripheralMessages.states[state]}
                </option>
              ))}
            </select>
            <span className="font-normal text-zinc-500">
              {peripheralMessages.stateHint}
            </span>
          </label>
        </div>

        <p
          aria-live="polite"
          className="mt-5 min-h-5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          role="status"
        >
          {feedback}
        </p>

        {fixtureState === PeripheralFixtureState.Loading ? (
          <Panel className="mt-4 grid min-h-80 place-items-center p-8">
            <div className="grid justify-items-center gap-3 text-sm text-zinc-500">
              <Spinner label={peripheralMessages.loading} />
              <span>{peripheralMessages.loading}</span>
            </div>
          </Panel>
        ) : null}

        {fixtureState === PeripheralFixtureState.Empty ? (
          <Panel aria-live="polite" className="mt-4">
            <EmptyState
              description={peripheralMessages.emptyDescription}
              icon={Unplug}
              title={peripheralMessages.emptyTitle}
            />
          </Panel>
        ) : null}

        {fixtureState === PeripheralFixtureState.Error ? (
          <Panel className="mt-4" role="alert">
            <EmptyState
              action={
                <Button
                  onClick={restoreSuccessState}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Secondary}
                >
                  {peripheralMessages.retry}
                </Button>
              }
              description={peripheralMessages.errorDescription}
              icon={AlertTriangle}
              title={peripheralMessages.errorTitle}
            />
          </Panel>
        ) : null}

        {fixtureState === PeripheralFixtureState.Success ? (
          <div className="mt-4">
            <PeripheralList
              messages={peripheralMessages}
              onToggle={handleToggle}
              peripherals={peripherals}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
