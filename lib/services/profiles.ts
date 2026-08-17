import { invoke, isTauri } from "@tauri-apps/api/core";

import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { Profile, ProfileApplicationResult } from "@/lib/types/profile";

const APPLY_PROFILE_COMMAND = "apply_profile";
const EXPORT_PROFILES_RECOVERY_COPY_COMMAND =
  "export_profiles_recovery_copy";
const GET_PROFILES_COMMAND = "get_profiles";
const SAVE_PROFILE_COMMAND = "save_profile";

function assertNative(): void {
  if (!isTauri()) {
    throw createNativeAgentError({
      code: NativeAgentErrorCode.Unavailable,
      message: "Local profiles are available in the desktop app.",
    });
  }
}

async function call<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  assertNative();
  try {
    return await invoke<T>(command, args);
  } catch (cause: unknown) {
    throw createNativeAgentError(cause);
  }
}

export function getProfiles(): Promise<Profile[]> {
  return call(GET_PROFILES_COMMAND);
}

export function exportProfilesRecoveryCopy(): Promise<string> {
  return call(EXPORT_PROFILES_RECOVERY_COPY_COMMAND);
}

export function saveProfile(profile: Profile): Promise<Profile[]> {
  return call(SAVE_PROFILE_COMMAND, { profile });
}

export function applyProfile(
  profileId: string,
): Promise<ProfileApplicationResult> {
  return call(APPLY_PROFILE_COMMAND, { profileId });
}
