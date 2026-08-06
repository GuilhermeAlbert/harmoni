"use client";

import {
  Accessibility,
  AlertTriangle,
  Camera,
  Keyboard,
  Mic2,
  RefreshCw,
  ShieldQuestion,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { PermissionSummaryProps } from "./types";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { SpinnerSize } from "@/components/spinner/enums";
import { PermissionCategory } from "@/lib/enums/permission-category";
import { PermissionStatus } from "@/lib/enums/permission-status";
import {
  getPermissionStatus,
  openPermissionSettings,
} from "@/lib/services/permissions";
import type { Permission } from "@/lib/types/permission";

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
  [PermissionStatus.Unknown]: "unknown",
};

const STATUS_TONES: Record<PermissionStatus, BadgeTone> = {
  [PermissionStatus.Authorized]: BadgeTone.Success,
  [PermissionStatus.Denied]: BadgeTone.Danger,
  [PermissionStatus.NotDetermined]: BadgeTone.Warning,
  [PermissionStatus.Restricted]: BadgeTone.Danger,
  [PermissionStatus.Unsupported]: BadgeTone.Neutral,
  [PermissionStatus.Unknown]: BadgeTone.Neutral,
};

export function PermissionSummary({
  messages,
}: PermissionSummaryProps): React.ReactNode {
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [permissions, setPermissions] = useState<readonly Permission[] | null>(
    null,
  );
  const [reviewingCategory, setReviewingCategory] =
    useState<PermissionCategory | null>(null);
  const loading = permissions === null && !loadFailed;

  useEffect(() => {
    let active = true;

    getPermissionStatus()
      .then((nextPermissions) => {
        if (!active) {
          return;
        }

        setPermissions(nextPermissions);
        setFeedback(messages.permissionsLoaded);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setLoadFailed(true);
        setFeedback(messages.permissionsLoadError);
      });

    return () => {
      active = false;
    };
  }, [attempt, messages.permissionsLoadError, messages.permissionsLoaded]);

  const refresh = (): void => {
    setFeedback("");
    setLoadFailed(false);
    setPermissions(null);
    setAttempt((currentAttempt) => currentAttempt + 1);
  };

  const reviewPermission = async (
    category: PermissionCategory,
  ): Promise<void> => {
    setFeedback("");
    setReviewingCategory(category);

    try {
      await openPermissionSettings(category);
      setFeedback(messages.reviewOpened);
    } catch {
      setFeedback(messages.reviewError);
    } finally {
      setReviewingCategory(null);
    }
  };

  return (
    <Panel className="overflow-hidden">
      <header className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">{messages.permissionsTitle}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
            {messages.permissionsDescription}
          </p>
        </div>
        <Button
          disabled={loading}
          onClick={refresh}
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          {loading ? (
            <Spinner label={messages.refreshingPermissions} size={SpinnerSize.Small} />
          ) : (
            <RefreshCw aria-hidden="true" className="size-3.5" />
          )}
          {loading ? messages.refreshingPermissions : messages.refreshPermissions}
        </Button>
      </header>

      <p
        aria-live="polite"
        className="min-h-9 border-b border-zinc-200 px-5 py-2 text-xs text-zinc-600 dark:border-white/[0.08] dark:text-zinc-400"
        role="status"
      >
        {feedback}
      </p>

      {loading ? (
        <div className="grid min-h-56 place-items-center p-8">
          <div className="grid justify-items-center gap-3 text-sm text-zinc-500">
            <Spinner label={messages.loading} />
            <span>{messages.loading}</span>
          </div>
        </div>
      ) : null}

      {permissions?.length === 0 ? (
        <EmptyState
          description={messages.emptyDescription}
          icon={ShieldQuestion}
          title={messages.emptyTitle}
        />
      ) : null}

      {loadFailed ? (
        <div className="grid justify-items-center pb-6" role="alert">
          <EmptyState
            description={messages.errorDescription}
            icon={AlertTriangle}
            title={messages.errorTitle}
          />
          <Button
            onClick={refresh}
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
          >
            {messages.retryPermissions}
          </Button>
        </div>
      ) : null}

      {permissions && permissions.length > 0 ? (
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
                  <span
                    className="truncate text-sm font-medium"
                    id={`permission-${permission.category}`}
                  >
                    {messages.categories[CATEGORY_MESSAGE_KEYS[permission.category]]}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={STATUS_TONES[permission.status]}>
                    {messages.statuses[STATUS_MESSAGE_KEYS[permission.status]]}
                  </Badge>
                  <Button
                    aria-describedby={`permission-${permission.category}`}
                    disabled={
                      permission.status === PermissionStatus.Unsupported ||
                      reviewingCategory !== null
                    }
                    onClick={() => reviewPermission(permission.category)}
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Ghost}
                  >
                    {reviewingCategory === permission.category ? (
                      <Spinner
                        label={messages.openingSettings}
                        size={SpinnerSize.Small}
                      />
                    ) : null}
                    {reviewingCategory === permission.category
                      ? messages.openingSettings
                      : messages.reviewPermission}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Panel>
  );
}
