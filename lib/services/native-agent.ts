import { invoke, isTauri } from "@tauri-apps/api/core";

import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import type {
  AgentHealth,
  NativeAgentError,
} from "@/lib/types/native-agent";

const GET_AGENT_HEALTH_COMMAND = "get_agent_health";

export async function getAgentHealth(): Promise<AgentHealth> {
  if (!isTauri()) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.Unavailable,
      message: "The native agent is unavailable.",
    });
  }

  try {
    return await invoke<AgentHealth>(GET_AGENT_HEALTH_COMMAND);
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}

export function createNativeAgentError(cause: unknown): NativeAgentError {
  const payload = readErrorPayload(cause);
  return Object.assign(new Error(payload.message), {
    name: "NativeAgentError",
    code: payload.code,
  });
}

function readErrorPayload(cause: unknown): {
  code: NativeAgentErrorCode;
  message: string;
} {
  if (typeof cause !== "object" || cause === null) {
    return fallbackErrorPayload();
  }

  const code = "code" in cause ? cause.code : undefined;
  const message = "message" in cause ? cause.message : undefined;

  if (!isNativeAgentErrorCode(code) || typeof message !== "string") {
    return fallbackErrorPayload();
  }

  return { code, message };
}

function fallbackErrorPayload(): {
  code: NativeAgentErrorCode;
  message: string;
} {
  return {
    code: NativeAgentErrorCode.Unavailable,
    message: "The native agent is unavailable.",
  };
}

function isNativeAgentErrorCode(value: unknown): value is NativeAgentErrorCode {
  return Object.values(NativeAgentErrorCode).some((code) => code === value);
}
