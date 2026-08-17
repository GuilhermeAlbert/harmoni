import { useContext } from "react";

import { PeripheralsContext } from "./context";
import type { PeripheralsContextValue } from "./types";

export function usePeripherals(): PeripheralsContextValue {
  const value = useContext(PeripheralsContext);
  if (!value) {
    throw new Error("usePeripherals must be used within PeripheralsProvider.");
  }
  return value;
}
