import { createContext } from "react";
import type { PeripheralsContextValue } from "./types";
export const PeripheralsContext = createContext<PeripheralsContextValue | null>(null);
