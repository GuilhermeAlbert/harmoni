"use client";

import {
  AlertTriangle,
  RefreshCw,
  ShieldQuestion,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { PermissionSummaryProps } from "./types";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import { Spinner } from "@/components/spinner";
import { SpinnerSize } from "@/components/spinner/enums";
import { PermissionCategory } from "@/lib/enums/permission-category";
import {
  getPermissionStatus,
  openPermissionSettings,
  subscribeToPermissionWindowFocus,
} from "@/lib/services/permissions";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { Permission } from "@/lib/types/permission";
import { PermissionRow } from "./permission-row";

export function PermissionSummary({
  messages,
}: PermissionSummaryProps): React.ReactNode {
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loadError, setLoadError] = useState<string>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [permissions, setPermissions] = useState<readonly Permission[] | null>(
    null,
  );
  const [reviewingCategory, setReviewingCategory] =
    useState<PermissionCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loading = permissions === null && !loadFailed;

  useEffect(() => {
    let active = true;

    getPermissionStatus()
      .then((nextPermissions) => {
        if (!active) {
          return;
        }

        setPermissions(nextPermissions);
        setLoadError(undefined);
        setLoadFailed(false);
        setRefreshing(false);
        setFeedback(messages.permissionsLoaded);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }

        setLoadError(createNativeAgentError(cause).message);
        setLoadFailed(true);
        setRefreshing(false);
        setFeedback(messages.permissionsLoadError);
      });

    return () => {
      active = false;
    };
  }, [attempt, messages.permissionsLoadError, messages.permissionsLoaded]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    subscribeToPermissionWindowFocus(() => {
      if (active) {
        setFeedback("");
        setLoadError(undefined);
        setLoadFailed(false);
        setRefreshing(true);
        setAttempt((currentAttempt) => currentAttempt + 1);
      }
    })
      .then((nextUnsubscribe) => {
        if (active) unsubscribe = nextUnsubscribe;
        else nextUnsubscribe();
      })
      .catch(() => undefined);

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const refresh = (): void => {
    setFeedback("");
    setLoadError(undefined);
    setLoadFailed(false);
    setRefreshing(true);
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
          disabled={loading || refreshing}
          onClick={refresh}
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
        >
          {loading || refreshing ? (
            <Spinner label={messages.refreshingPermissions} size={SpinnerSize.Small} />
          ) : (
            <RefreshCw aria-hidden="true" className="size-3.5" />
          )}
          {loading || refreshing ? messages.refreshingPermissions : messages.refreshPermissions}
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
            description={loadError ?? messages.errorDescription}
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
          {permissions.map((permission) => (
            <PermissionRow
              key={permission.id}
              messages={messages}
              onReview={reviewPermission}
              permission={permission}
              reviewingCategory={reviewingCategory}
            />
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}
