import { useContext } from "react";

import { CamerasContext } from "./context";
import type { CamerasContextValue } from "./types";

export function useCameras(): CamerasContextValue {
  const context = useContext(CamerasContext);
  if (!context) {
    throw new Error("useCameras must be used within CamerasProvider.");
  }
  return context;
}
