import { ProfileOrigin } from "@/lib/enums/profile-origin";
import { ProfilePreset } from "@/lib/enums/profile-preset";
import type { Profile } from "@/lib/types/profile";

export const PROFILE_FIXTURES = [
  {
    active: true,
    id: "work",
    name: "Work",
    origin: ProfileOrigin.Fixture,
    preferences: {
      audioInputId: "shure-mv7-input",
      audioOutputId: "studio-display-output",
      cameraEnabled: true,
      cameraId: "logitech-brio",
      inputVolume: 72,
      microphonesMuted: false,
    },
    preset: ProfilePreset.Work,
  },
  {
    active: false,
    id: "recording",
    name: "Recording",
    origin: ProfileOrigin.Fixture,
    preferences: {
      audioInputId: "shure-mv7-input",
      audioOutputId: "studio-display-output",
      cameraEnabled: true,
      cameraId: "logitech-brio",
      inputVolume: 82,
      microphonesMuted: false,
    },
    preset: ProfilePreset.Recording,
  },
  {
    active: false,
    id: "private",
    name: "Private",
    origin: ProfileOrigin.Fixture,
    preferences: {
      audioInputId: "shure-mv7-input",
      audioOutputId: "studio-display-output",
      cameraEnabled: false,
      cameraId: "logitech-brio",
      inputVolume: 0,
      microphonesMuted: true,
    },
    preset: ProfilePreset.Private,
  },
] as const satisfies readonly Profile[];
