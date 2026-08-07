import type { ProfileOrigin } from "@/lib/enums/profile-origin";
import type { ProfilePreset } from "@/lib/enums/profile-preset";

export interface ProfileDevicePreferences {
  readonly audioInputId?: string;
  readonly setAudioInputDefault: boolean;
  readonly audioOutputId?: string;
  readonly cameraId?: string;
  readonly inputVolume?: number;
  readonly microphonesMuted?: boolean;
  readonly stopCameraPreview: boolean;
}

export interface Profile {
  readonly active: boolean;
  readonly description?: string;
  readonly id: string;
  readonly name: string;
  readonly origin: ProfileOrigin;
  readonly preferences: ProfileDevicePreferences;
  readonly preset?: ProfilePreset;
}

export interface ProfileOperationResult {
  readonly operation: string;
  readonly status: "failed" | "missing-device" | "skipped-not-requested" | "skipped-unsupported" | "success";
  readonly error?: { readonly code: string; readonly message: string };
}

export interface ProfileApplicationResult {
  readonly fullyApplied: boolean;
  readonly operations: readonly ProfileOperationResult[];
  readonly profileId: string;
  readonly profiles: Profile[];
}
