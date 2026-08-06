"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

import { NativeAgentContext } from "./context";
import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { NativeAgentState } from "@/lib/enums/native-agent-state";
import {
  createNativeAgentError,
  getAgentHealth,
} from "@/lib/services/native-agent";
import type { AgentHealth } from "@/lib/types/native-agent";

export function NativeAgentProvider({
  children,
}: PropsWithChildren): React.ReactNode {
  const [attempt, setAttempt] = useState(0);
  const [health, setHealth] = useState<AgentHealth | null>(null);
  const [state, setState] = useState(NativeAgentState.Loading);

  useEffect(() => {
    let active = true;

    getAgentHealth()
      .then((nextHealth) => {
        if (!active) {
          return;
        }

        setHealth(nextHealth);
        setState(NativeAgentState.Ready);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }

        const error = createNativeAgentError(cause);
        setState(
          error.code === NativeAgentErrorCode.Unavailable
            ? NativeAgentState.Unavailable
            : NativeAgentState.Error,
        );
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = (): void => {
    setHealth(null);
    setState(NativeAgentState.Loading);
    setAttempt((currentAttempt) => currentAttempt + 1);
  };

  return (
    <NativeAgentContext.Provider value={{ health, retry, state }}>
      {children}
    </NativeAgentContext.Provider>
  );
}
