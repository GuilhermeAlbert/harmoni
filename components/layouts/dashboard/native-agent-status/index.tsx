import { MonitorCog } from "lucide-react";

import { DeviceEventIndicator } from "./device-event-indicator";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { ButtonSize, ButtonVariant } from "@/components/button/enums";
import { Spinner } from "@/components/spinner";
import { SpinnerSize } from "@/components/spinner/enums";
import { useLanguage } from "@/contexts/language/use-language";
import { useNativeAgent } from "@/contexts/native-agent/use-native-agent";
import { NativeAgentState } from "@/lib/enums/native-agent-state";

export function NativeAgentStatus(): React.ReactNode {
  const { health, retry, state } = useNativeAgent();
  const { messages } = useLanguage();
  const nativeMessages = messages.nativeAgent;

  return (
    <section
      aria-live="polite"
      aria-atomic="true"
      className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/[0.08] dark:bg-white/[0.035]"
    >
      <div className="flex items-center gap-2">
        <MonitorCog
          aria-hidden="true"
          className="size-4 shrink-0 text-zinc-500"
        />
        <h2 className="text-xs font-semibold">{nativeMessages.title}</h2>
        {state === NativeAgentState.Ready ? (
          <Badge className="ml-auto" tone={BadgeTone.Success}>
            {nativeMessages.ready}
          </Badge>
        ) : null}
      </div>

      {state === NativeAgentState.Loading ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <Spinner label={nativeMessages.loading} size={SpinnerSize.Small} />
          <span>{nativeMessages.loading}</span>
        </div>
      ) : null}

      {state === NativeAgentState.Ready && health ? (
        <>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            {nativeMessages.agentVersionShort} {health.agentVersion}
            <span aria-hidden="true"> · </span>
            {health.architecture}
          </p>
          <DeviceEventIndicator />
        </>
      ) : null}

      {state === NativeAgentState.Unavailable ||
      state === NativeAgentState.Error ? (
        <div className="mt-3">
          <Badge tone={BadgeTone.Danger}>
            {state === NativeAgentState.Unavailable
              ? nativeMessages.unavailable
              : nativeMessages.error}
          </Badge>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
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
    </section>
  );
}
