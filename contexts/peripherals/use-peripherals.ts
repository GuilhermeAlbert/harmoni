import { useContext } from "react";
import { PeripheralsContext } from "./context";
export function usePeripherals() { const value = useContext(PeripheralsContext); if (!value) throw new Error("usePeripherals must be used within PeripheralsProvider."); return value; }
