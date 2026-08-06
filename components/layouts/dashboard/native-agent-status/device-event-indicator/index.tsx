"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { Spinner } from "@/components/spinner";
import { SpinnerSize } from "@/components/spinner/enums";
import { useLanguage } from "@/contexts/language/use-language";
import {
  subscribeToDeviceEvents,
  triggerDevelopmentDeviceEvent,
} from "@/lib/services/device-events";
import type { DeviceEvent } from "@/lib/types/device-event";

export function DeviceEventIndicator(): React.ReactNode {
  const [lastEvent, setLastEvent] = useState<DeviceEvent | null>(null);
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const { messages } = useLanguage();
  const eventMessages = messages.nativeAgent.developmentEvent;

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    subscribeToDeviceEvents((event) => {
      if (active) {
        setLastEvent(event);
        setSubscriptionFailed(false);
      }
    })
      .then((nextUnsubscribe) => {
        if (active) {
          unsubscribe = nextUnsubscribe;
        } else {
          nextUnsubscribe();
        }
      })
      .catch(() => {
        if (active) {
          setSubscriptionFailed(true);
        }
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const triggerEvent = async (): Promise<void> => {
    setTriggering(true);
    setSubscriptionFailed(false);

    try {
      await triggerDevelopmentDeviceEvent();
    } catch {
      setSubscriptionFailed(true);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
      <p className="font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {eventMessages.label}
      </p>
      <Button
        className="mt-2 w-full"
        disabled={triggering}
        onClick={triggerEvent}
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
      >
        {triggering ? (
          <>
            <Spinner
              label={eventMessages.triggering}
              size={SpinnerSize.Small}
            />
            {eventMessages.triggering}
          </>
        ) : (
          eventMessages.trigger
        )}
      </Button>
      <div
        aria-atomic="true"
        aria-live="polite"
        className="mt-2 min-h-5 text-xs leading-5 text-zinc-500"
      >
        {subscriptionFailed ? eventMessages.error : null}
        {!subscriptionFailed && !lastEvent ? eventMessages.waiting : null}
        {!subscriptionFailed && lastEvent ? (
          <span>
            {eventMessages.categories[lastEvent.category]}
            <span aria-hidden="true"> · </span>
            {eventMessages.changes[lastEvent.change]}
            <span aria-hidden="true"> · </span>
            <span className="font-[family-name:var(--font-commit-mono)]">
              {lastEvent.id}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
