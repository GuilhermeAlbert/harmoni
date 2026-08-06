import { createContext } from "react";

import type { AudioDevicesContextValue } from "./types";

export const AudioDevicesContext = createContext<
  AudioDevicesContextValue | undefined
>(undefined);
