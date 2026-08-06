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
import { Panel } from "@/components/panel";
import { Slider } from "@/components/slider";
import { Spinner } from "@/components/spinner";
import { Switch } from "@/components/switch";
import { ThemeSelector } from "@/components/theme-selector";

export function DesignSystemPreview(): React.ReactNode {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(72);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 transition-colors motion-reduce:transition-none dark:bg-[#090909] dark:text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col justify-between gap-6 border-b border-zinc-200 pb-8 dark:border-white/[0.08] sm:flex-row sm:items-end">
          <div>
            <Brand />
            <p className="mt-8 font-[family-name:var(--font-commit-mono)] text-[0.6875rem] uppercase tracking-[0.16em] text-zinc-500">
              Design foundation
            </p>
            <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-geist)] text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
              Precise controls for every device.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              A restrained, accessible foundation for Harmoni&apos;s device
              management interface.
            </p>
          </div>
          <ThemeSelector />
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
                  Controls
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Complete interaction states at compact density.
                </p>
              </div>
              <Badge tone={enabled ? BadgeTone.Success : BadgeTone.Neutral}>
                {enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="mt-7 grid gap-6">
              <Slider
                label="Input volume"
                max={100}
                min={0}
                onChange={(event) => setVolume(Number(event.target.value))}
                value={volume}
                valueText={`${volume}%`}
              />
              <div className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">
                    Device monitoring
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    Receive connection and status changes.
                  </span>
                </span>
                <Switch
                  accessibleName="Device monitoring"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Button>Primary action</Button>
              <Button variant={ButtonVariant.Secondary}>Secondary</Button>
              <Button loading>Applying</Button>
              <IconButton
                accessibleName="Refresh devices"
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
                    Device states
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Semantic feedback never relies on color alone.
                  </p>
                </div>
              </div>
              <Spinner label="Discovering devices" />
            </div>
            <EmptyState
              action={
                <Button variant={ButtonVariant.Secondary}>Check again</Button>
              }
              description="Connected devices will appear here when discovery is available."
              icon={Inbox}
              title="No devices yet"
            />
          </Panel>
        </section>
      </div>
    </main>
  );
}

