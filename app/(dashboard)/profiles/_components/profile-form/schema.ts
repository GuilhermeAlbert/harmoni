import { z } from "zod";

import type { Messages } from "@/lib/types/messages";

export function createProfileFormSchema(messages: Messages["profiles"]["form"]["validation"]) {
  return z.object({
    applyInputVolume: z.boolean(),
    applyMicrophoneMute: z.boolean(),
    audioInputId: z.string(),
    audioOutputId: z.string(),
    cameraId: z.string(),
    description: z.string().trim().min(1, messages.descriptionRequired).min(4, messages.descriptionTooShort).max(120, messages.descriptionTooLong),
    inputVolume: z.number().min(0, messages.inputVolume).max(100, messages.inputVolume),
    microphonesMuted: z.boolean(),
    name: z.string().trim().min(1, messages.nameRequired).min(2, messages.nameTooShort).max(40, messages.nameTooLong),
    stopCameraPreview: z.boolean(),
    setAudioInputDefault: z.boolean(),
  }).superRefine((values, context) => {
    if ((values.setAudioInputDefault || values.applyInputVolume || values.applyMicrophoneMute) && !values.audioInputId) {
      context.addIssue({ code: "custom", message: messages.inputRequired, path: ["audioInputId"] });
    }
  });
}

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileFormSchema>>;
