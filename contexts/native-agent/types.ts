import type { NativeAgentState } from "@/lib/enums/native-agent-state";
import type { AgentHealth } from "@/lib/types/native-agent";

export interface NativeAgentContextValue {
  health: AgentHealth | null;
  retry: () => void;
  state: NativeAgentState;
}
