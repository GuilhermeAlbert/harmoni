import {
  Accessibility,
  AlertTriangle,
  Camera,
  Keyboard,
  Mic2,
  ShieldQuestion,
  type LucideIcon,
} from "lucide-react";

import type { PermissionSummaryProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { PermissionCategory } from "@/lib/enums/permission-category";
import { PermissionStatus } from "@/lib/enums/permission-status";
import { SettingsFixtureState } from "@/lib/enums/settings-fixture-state";

const PERMISSION_ICONS: Record<PermissionCategory, LucideIcon> = {
  [PermissionCategory.Accessibility]: Accessibility,
  [PermissionCategory.Camera]: Camera,
  [PermissionCategory.InputMonitoring]: Keyboard,
  [PermissionCategory.Microphone]: Mic2,
};

const CATEGORY_MESSAGE_KEYS: Record<
  PermissionCategory,
  keyof PermissionSummaryProps["messages"]["categories"]
> = {
  [PermissionCategory.Accessibility]: "accessibility",
  [PermissionCategory.Camera]: "camera",
  [PermissionCategory.InputMonitoring]: "inputMonitoring",
  [PermissionCategory.Microphone]: "microphone",
};

const STATUS_MESSAGE_KEYS: Record<
  PermissionStatus,
  keyof PermissionSummaryProps["messages"]["statuses"]
> = {
  [PermissionStatus.Authorized]: "authorized",
  [PermissionStatus.Denied]: "denied",
  [PermissionStatus.NotDetermined]: "notDetermined",
  [PermissionStatus.Restricted]: "restricted",
  [PermissionStatus.Unsupported]: "unsupported",
};

const STATUS_TONES: Record<PermissionStatus, BadgeTone> = {
  [PermissionStatus.Authorized]: BadgeTone.Success,
  [PermissionStatus.Denied]: BadgeTone.Danger,
  [PermissionStatus.NotDetermined]: BadgeTone.Warning,
  [PermissionStatus.Restricted]: BadgeTone.Danger,
  [PermissionStatus.Unsupported]: BadgeTone.Neutral,
};

export function PermissionSummary({
  fixtureState,
  messages,
  permissions,
}: PermissionSummaryProps): React.ReactNode {
  return (
    <Panel className="overflow-hidden">
      <header className="border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]">
        <h2 className="text-sm font-semibold">{messages.permissionsTitle}</h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
          {messages.permissionsDescription}
        </p>
      </header>

      {fixtureState === SettingsFixtureState.Loading ? (
        <div className="grid min-h-56 place-items-center p-8">
          <div className="grid justify-items-center gap-3 text-sm text-zinc-500">
            <Spinner label={messages.loading} />
            <span>{messages.loading}</span>
          </div>
        </div>
      ) : null}

      {fixtureState === SettingsFixtureState.Empty ? (
        <EmptyState
          description={messages.emptyDescription}
          icon={ShieldQuestion}
          title={messages.emptyTitle}
        />
      ) : null}

      {fixtureState === SettingsFixtureState.Error ? (
        <div role="alert">
          <EmptyState
            description={messages.errorDescription}
            icon={AlertTriangle}
            title={messages.errorTitle}
          />
        </div>
      ) : null}

      {fixtureState === SettingsFixtureState.Success ? (
        <ul className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
          {permissions.map((permission) => {
            const Icon = PERMISSION_ICONS[permission.category];

            return (
              <li
                className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5"
                key={permission.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="truncate text-sm font-medium">
                    {messages.categories[CATEGORY_MESSAGE_KEYS[permission.category]]}
                  </span>
                </div>
                <Badge tone={STATUS_TONES[permission.status]}>
                  {messages.statuses[STATUS_MESSAGE_KEYS[permission.status]]}
                </Badge>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Panel>
  );
}
