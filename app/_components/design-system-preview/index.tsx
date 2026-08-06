"use client";

import { AudioLines, Inbox, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Brand } from "@/components/brand";
import { Button } from "@/components/button";
import { ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { IconButton } from "@/components/icon-button";
import { LanguageSelector } from "@/components/language-selector";
import { Panel } from "@/components/panel";
import { Slider } from "@/components/slider";
import { Spinner } from "@/components/spinner";
import { Switch } from "@/components/switch";
import { ThemeSelector } from "@/components/theme-selector";
import { useLanguage } from "@/contexts/language/use-language";

export function DesignSystemPreview(): React.ReactNode {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(72);
  const { messages } = useLanguage();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 transition-colors motion-reduce:transition-none dark:bg-[#090909] dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col justify-between gap-6 border-b border-zinc-200 pb-8 dark:border-white/[0.08] sm:flex-row sm:items-end">
          <div>
            <Brand />
            <p className="mt-8 font-[family-name:var(--font-commit-mono)] text-[0.6875rem] uppercase tracking-[0.16em] text-zinc-500">
              {messages.preview.eyebrow}
            </p>
            <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-geist)] text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              {messages.preview.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {messages.preview.description}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <LanguageSelector />
            <ThemeSelector />
          </div>
        </header>

        <section
          aria-labelledby="controls-title"
          className="mt-8 grid gap-4 lg:grid-cols-2"
        >
          <Panel className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="font-[family-name:var(--font-geist)] text-lg font-semibold"
                  id="controls-title"
                >
                  {messages.preview.controlsTitle}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {messages.preview.controlsDescription}
                </p>
              </div>
              <Badge tone={enabled ? BadgeTone.Success : BadgeTone.Neutral}>
                {enabled
                  ? messages.preview.enabled
                  : messages.preview.disabled}
              </Badge>
            </div>

            <div className="mt-7 grid gap-6">
              <Slider
                label={messages.preview.inputVolume}
                max={100}
                min={0}
                onChange={(event) => setVolume(Number(event.target.value))}
                value={volume}
                valueText={`${volume}%`}
              />
              <div className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">
                    {messages.preview.monitoringTitle}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {messages.preview.monitoringDescription}
                  </span>
                </span>
                <Switch
                  accessibleName={messages.preview.monitoringTitle}
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Button>{messages.preview.primaryAction}</Button>
              <Button variant={ButtonVariant.Secondary}>
                {messages.preview.secondaryAction}
              </Button>
              <Button loading loadingLabel={messages.preview.working}>
                {messages.preview.applying}
              </Button>
              <IconButton
                accessibleName={messages.preview.refreshDevices}
                icon={RefreshCw}
              />
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
                  <AudioLines aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="font-[family-name:var(--font-geist)] text-sm font-semibold">
                    {messages.preview.deviceStatesTitle}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {messages.preview.deviceStatesDescription}
                  </p>
                </div>
              </div>
              <Spinner label={messages.preview.discoveringDevices} />
            </div>
            <EmptyState
              action={
                <Button variant={ButtonVariant.Secondary}>
                  {messages.preview.checkAgain}
                </Button>
              }
              description={messages.preview.noDevicesDescription}
              icon={Inbox}
              title={messages.preview.noDevicesTitle}
            />
          </Panel>
        </section>
      </div>
    </main>
  );
}
