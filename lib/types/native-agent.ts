import type { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";

export type AgentHealth = {
  protocolVersion: number;
  appVersion: string;
  agentVersion: string;
  macOSVersion: string;
  architecture: string;
};

export type NativeAgentError = Error & {
  code: NativeAgentErrorCode;
};
