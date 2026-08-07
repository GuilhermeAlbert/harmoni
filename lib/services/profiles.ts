import { invoke, isTauri } from "@tauri-apps/api/core";

import { NativeAgentErrorCode } from "@/lib/enums/native-agent-error-code";
import { createNativeAgentError } from "@/lib/services/native-agent";
import type { Profile, ProfileApplicationResult } from "@/lib/types/profile";

function assertNative(): void {
  if (!isTauri()) throw createNativeAgentError({ code: NativeAgentErrorCode.Unavailable, message: "Local profiles are available in the desktop app." });
}

async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  assertNative();
  try { return await invoke<T>(command, args); } catch (cause: unknown) { throw createNativeAgentError(cause); }
}

export function getProfiles(): Promise<Profile[]> { return call("get_profiles"); }
export function exportProfilesRecoveryCopy(): Promise<string> { return call("export_profiles_recovery_copy"); }
export function saveProfile(profile: Profile): Promise<Profile[]> { return call("save_profile", { profile }); }
export function applyProfile(profileId: string): Promise<ProfileApplicationResult> { return call("apply_profile", { profileId }); }
