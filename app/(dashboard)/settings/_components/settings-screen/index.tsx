"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { MonitorCog, Power } from "lucide-react";

import type { SettingsScreenProps } from "./types";
import { PermissionSummary } from "../permission-summary";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { LanguageSelector } from "@/components/language-selector";
import { Panel } from "@/components/panel";
import { Switch } from "@/components/switch";
import { ThemeSelector } from "@/components/theme-selector";
import { useLanguage } from "@/contexts/language/use-language";
import { PERMISSION_FIXTURES } from "@/lib/constants/permission-fixtures";
import { SettingsFixtureState } from "@/lib/enums/settings-fixture-state";

const SETTINGS_FIXTURE_STATES = [
  SettingsFixtureState.Success,
  SettingsFixtureState.Loading,
  SettingsFixtureState.Empty,
  SettingsFixtureState.Error,
] as const;

function isSettingsFixtureState(value: string): value is SettingsFixtureState {
  return SETTINGS_FIXTURE_STATES.some((state) => state === value);
}

export function SettingsScreen({
  appVersion,
}: SettingsScreenProps): React.ReactNode {
  const [feedback, setFeedback] = useState("");
  const [launchAtLogin, setLaunchAtLogin] = useState(false);
  const [permissionState, setPermissionState] = useState(
    SettingsFixtureState.Success,
  );
  const { messages } = useLanguage();
  const settingsMessages = messages.settingsScreen;

  const handleLaunchAtLoginChange = (enabled: boolean): void => {
    setLaunchAtLogin(enabled);
    setFeedback(
      enabled
        ? settingsMessages.feedback.launchEnabled
        : settingsMessages.feedback.launchDisabled,
    );
  };

  const handlePermissionStateChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    if (isSettingsFixtureState(event.target.value)) {
      setPermissionState(event.target.value);
    }
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <Badge tone={BadgeTone.Warning}>{settingsMessages.fixtureLabel}</Badge>
          <p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {settingsMessages.eyebrow}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-geist)] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-4xl">
            {settingsMessages.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {settingsMessages.description}
          </p>
        </div>

        <p
          aria-live="polite"
          className="mt-5 min-h-5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          role="status"
        >
          {feedback}
        </p>

        <div className="mt-4 grid gap-4">
          <Panel className="overflow-hidden">
            <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold">
                {settingsMessages.interfaceTitle}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {settingsMessages.interfaceDescription}
              </p>
            </header>
            <div className="grid gap-6 p-5 md:grid-cols-2">
              <ThemeSelector />
              <LanguageSelector />
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold">
                {settingsMessages.systemTitle}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {settingsMessages.systemDescription}
              </p>
            </header>
            <div className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                  <Power aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-medium">
                    {settingsMessages.launchAtLogin}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {settingsMessages.launchAtLoginDescription}
                  </p>
                  <Badge className="mt-2" tone={BadgeTone.Warning}>
                    {settingsMessages.simulatedControl}
                  </Badge>
                </div>
              </div>
              <Switch
                accessibleName={settingsMessages.launchAtLogin}
                checked={launchAtLogin}
                onCheckedChange={handleLaunchAtLoginChange}
              />
            </div>
          </Panel>

          <label className="grid max-w-sm gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {settingsMessages.permissionStateLabel}
            <select
              className="min-h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:outline-white"
              onChange={handlePermissionStateChange}
              value={permissionState}
            >
              {SETTINGS_FIXTURE_STATES.map((state) => (
                <option key={state} value={state}>
                  {settingsMessages.states[state]}
                </option>
              ))}
            </select>
            <span className="font-normal text-zinc-500">
              {settingsMessages.permissionStateHint}
            </span>
          </label>

          <PermissionSummary
            fixtureState={permissionState}
            messages={settingsMessages}
            permissions={PERMISSION_FIXTURES}
          />

          <Panel className="overflow-hidden">
            <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
              <h2 className="text-sm font-semibold">
                {settingsMessages.appInfoTitle}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {settingsMessages.appInfoDescription}
              </p>
            </header>
            <div className="flex items-start gap-3 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                <MonitorCog aria-hidden="true" className="size-4" />
              </span>
              <dl className="grid flex-1 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-zinc-500">{settingsMessages.version}</dt>
                  <dd className="mt-1 font-[family-name:var(--font-commit-mono)] font-medium">{appVersion}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">{settingsMessages.platform}</dt>
                  <dd className="mt-1 font-medium">{settingsMessages.platformValue}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">{settingsMessages.runtime}</dt>
                  <dd className="mt-1 font-medium">{settingsMessages.runtimeValue}</dd>
                </div>
              </dl>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
