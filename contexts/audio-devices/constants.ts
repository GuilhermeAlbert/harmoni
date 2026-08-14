import { DeviceEventCategory } from "@/lib/enums/device-event-category";

export const AUDIO_EVENT_CATEGORIES: readonly DeviceEventCategory[] = [
  DeviceEventCategory.Audio,
  DeviceEventCategory.AudioInput,
  DeviceEventCategory.AudioOutput,
];

export const AUDIO_REFRESH_DEBOUNCE_MILLISECONDS = 150;
