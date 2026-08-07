"use client";

import { useState } from "react";
import { MonitorCog, Power } from "lucide-react";

import { PermissionSummary } from "../permission-summary";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { LanguageSelector } from "@/components/language-selector";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { SpinnerSize } from "@/components/spinner/enums";
import { Switch } from "@/components/switch";
import { ThemeSelector } from "@/components/theme-selector";
import { useLanguage } from "@/contexts/language/use-language";
import { useNativeAgent } from "@/contexts/native-agent/use-native-agent";
import { NativeAgentState } from "@/lib/enums/native-agent-state";

export function SettingsScreen(): React.ReactNode {
  const [feedback, setFeedback] = useState("");
  const [launchAtLogin, setLaunchAtLogin] = useState(false);
  const { messages } = useLanguage();
  const { health, retry, state } = useNativeAgent();
  const nativeMessages = messages.nativeAgent;
  const settingsMessages = messages.settingsScreen;

  const handleLaunchAtLoginChange = (enabled: boolean): void => {
    setLaunchAtLogin(enabled);
    setFeedback(
      enabled
        ? settingsMessages.feedback.launchEnabled
        : settingsMessages.feedback.launchDisabled,
    );
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

          <PermissionSummary messages={settingsMessages} />

          <Panel className="overflow-hidden">
            <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">
                  {settingsMessages.appInfoTitle}
                </h2>
                {state === NativeAgentState.Ready ? (
                  <Badge tone={BadgeTone.Success}>{nativeMessages.ready}</Badge>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {settingsMessages.appInfoDescription}
              </p>
            </header>
            <div
              aria-atomic="true"
              aria-live="polite"
              className="flex items-start gap-3 p-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                <MonitorCog aria-hidden="true" className="size-4" />
              </span>
              {state === NativeAgentState.Loading ? (
                <div className="flex min-h-10 items-center gap-2 text-sm text-zinc-500">
                  <Spinner
                    label={nativeMessages.loading}
                    size={SpinnerSize.Small}
                  />
                  <span>{nativeMessages.loading}</span>
                </div>
              ) : null}

              {state === NativeAgentState.Ready && health ? (
                <dl className="grid flex-1 gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <dt className="text-xs text-zinc-500">
                      {nativeMessages.appVersion}
                    </dt>
                    <dd className="mt-1 font-[family-name:var(--font-commit-mono)] font-medium">
                      {health.appVersion}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">
                      {nativeMessages.agentVersion}
                    </dt>
                    <dd className="mt-1 font-[family-name:var(--font-commit-mono)] font-medium">
                      {health.agentVersion}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">
                      {nativeMessages.macOSVersion}
                    </dt>
                    <dd className="mt-1 font-medium">{health.macOSVersion}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">
                      {nativeMessages.architecture}
                    </dt>
                    <dd className="mt-1 font-[family-name:var(--font-commit-mono)] font-medium">
                      {health.architecture}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">
                      {nativeMessages.protocolVersion}
                    </dt>
                    <dd className="mt-1 font-[family-name:var(--font-commit-mono)] font-medium">
                      {health.protocolVersion}
                    </dd>
                  </div>
                  {Object.entries(health.watchers).map(([category, watcherState]) => (
                    <div key={category}>
                      <dt className="text-xs text-zinc-500">
                        {nativeMessages.watchers[category as keyof typeof nativeMessages.watchers]}
                      </dt>
                      <dd className="mt-1 font-medium">
                        {nativeMessages.watcherStates[watcherState]}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {state === NativeAgentState.Unavailable ||
              state === NativeAgentState.Error ? (
                <div className="flex-1">
                  <Badge tone={BadgeTone.Danger}>
                    {state === NativeAgentState.Unavailable
                      ? nativeMessages.unavailable
                      : nativeMessages.error}
                  </Badge>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {state === NativeAgentState.Unavailable
                      ? nativeMessages.unavailableDescription
                      : nativeMessages.errorDescription}
                  </p>
                  <Button
                    className="mt-3"
                    onClick={retry}
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Secondary}
                  >
                    {nativeMessages.retry}
                  </Button>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
