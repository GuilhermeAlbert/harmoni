import { invoke, isTauri } from "@tauri-apps/api/core";

import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { AudioDevice } from "@/lib/types/audio-device";

const GET_AUDIO_DEVICES_COMMAND = "get_audio_devices";

export async function getAudioDevices(): Promise<AudioDevice[]> {
  if (!isTauri()) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.Unavailable,
      message: "Native audio discovery is unavailable.",
    });
  }

  try {
    return await invoke<AudioDevice[]>(GET_AUDIO_DEVICES_COMMAND);
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}
