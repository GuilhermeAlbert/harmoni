import { useContext } from "react";

import { AudioDevicesContext } from "./context";
import type { AudioDevicesContextValue } from "./types";

export function useAudioDevices(): AudioDevicesContextValue {
  const context = useContext(AudioDevicesContext);

  if (!context) {
    throw new Error("useAudioDevices must be used within AudioDevicesProvider.");
  }

  return context;
}
