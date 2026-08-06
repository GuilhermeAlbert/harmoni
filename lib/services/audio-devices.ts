import { invoke, isTauri } from "@tauri-apps/api/core";

import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { AudioDevice } from "@/lib/types/audio-device";

const GET_AUDIO_DEVICES_COMMAND = "get_audio_devices";
const SET_AUDIO_MUTE_COMMAND = "set_audio_mute";
const SET_AUDIO_VOLUME_COMMAND = "set_audio_volume";
const SET_DEFAULT_AUDIO_INPUT_COMMAND = "set_default_audio_input";
const SET_DEFAULT_AUDIO_OUTPUT_COMMAND = "set_default_audio_output";

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

export async function setDefaultAudioDevice(
  device: AudioDevice,
): Promise<AudioDevice> {
  return invokeAudioMutation(
    device.direction === "input"
      ? SET_DEFAULT_AUDIO_INPUT_COMMAND
      : SET_DEFAULT_AUDIO_OUTPUT_COMMAND,
    { deviceId: device.id },
  );
}

export async function setAudioVolume(
  deviceId: string,
  volume: number,
): Promise<AudioDevice> {
  if (!Number.isInteger(volume) || volume < 0 || volume > 100) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.InvalidArgument,
      message: "Volume must be an integer between 0 and 100.",
    });
  }
  return invokeAudioMutation(SET_AUDIO_VOLUME_COMMAND, { deviceId, volume });
}

export async function setAudioMute(
  deviceId: string,
  muted: boolean,
): Promise<AudioDevice> {
  return invokeAudioMutation(SET_AUDIO_MUTE_COMMAND, { deviceId, muted });
}

async function invokeAudioMutation(
  command: string,
  args: Record<string, boolean | number | string>,
): Promise<AudioDevice> {
  if (!isTauri()) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.Unavailable,
      message: "Native audio control is unavailable.",
    });
  }
  try {
    return await invoke<AudioDevice>(command, args);
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}
