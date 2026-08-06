import { createContext } from "react";

import type { NativeAgentContextValue } from "./types";

export const NativeAgentContext = createContext<
  NativeAgentContextValue | undefined
>(undefined);
