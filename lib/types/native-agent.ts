import type { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";

export type AgentHealth = {
  protocolVersion: number;
  appVersion: string;
  agentVersion: string;
  macOSVersion: string;
  architecture: string;
  watchers: {
    audio: WatcherState;
    camera: WatcherState;
    peripheral: WatcherState;
  };
};

export type WatcherState = "retrying" | "running" | "stopped" | "stopping";

export type NativeAgentError = Error & {
  code: NativeAgentErrorCode;
};
