import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type {
  DeviceEvent,
  DeviceEventListener,
} from "@/lib/types/device-event";

const DEVICE_EVENT_NAME = "harmoni://device-change";
const TRIGGER_DEVELOPMENT_EVENT_COMMAND =
  "trigger_development_device_event";

export async function subscribeToDeviceEvents(
  listener: DeviceEventListener,
): Promise<() => void> {
  return listen<DeviceEvent>(DEVICE_EVENT_NAME, ({ payload }) => {
    listener(payload);
  });
}

export async function triggerDevelopmentDeviceEvent(): Promise<DeviceEvent> {
  return invoke<DeviceEvent>(TRIGGER_DEVELOPMENT_EVENT_COMMAND);
}
