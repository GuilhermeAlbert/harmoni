import { useContext } from "react";

import { NativeAgentContext } from "./context";
import type { NativeAgentContextValue } from "./types";

export function useNativeAgent(): NativeAgentContextValue {
  const context = useContext(NativeAgentContext);

  if (!context) {
    throw new Error("useNativeAgent must be used within NativeAgentProvider.");
  }

  return context;
}
