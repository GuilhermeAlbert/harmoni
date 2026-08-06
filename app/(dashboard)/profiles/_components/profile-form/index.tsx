import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { createProfileFormSchema, type ProfileFormValues } from "./schema";
import type { ProfileFormProps } from "./types";
import { Button } from "@/components/button";
import { ButtonVariant } from "@/components/button/enums";
import { Panel } from "@/components/panel";
import { useAudioDevices } from "@/contexts/audio-devices/use-audio-devices";
import { CAMERA_FIXTURES } from "@/lib/constants/camera-fixtures";
import { AudioDirection } from "@/lib/enums/audio-direction";
import { CameraStatus } from "@/lib/enums/camera-status";

const FIELD_CLASSES =
  "min-h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 aria-invalid:border-red-500 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:outline-white";

export function ProfileForm({
  messages,
  onCancel,
  onSave,
  profile,
}: ProfileFormProps): React.ReactNode {
  const presetMessages = profile?.preset
    ? messages.presets[profile.preset]
    : null;
  const { devices: audioDevices } = useAudioDevices();
  const schema = createProfileFormSchema(messages.form.validation);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      audioInputId:
        profile?.preferences.audioInputId ?? "shure-mv7-input",
      audioOutputId:
        profile?.preferences.audioOutputId ?? "studio-display-output",
      cameraEnabled: profile?.preferences.cameraEnabled ?? true,
      cameraId: profile?.preferences.cameraId ?? "logitech-brio",
      description:
        profile?.description ?? presetMessages?.description ?? "",
      inputVolume: profile?.preferences.inputVolume ?? 65,
      microphonesMuted: profile?.preferences.microphonesMuted ?? false,
      name: profile?.name ?? presetMessages?.name ?? "",
    },
    resolver: zodResolver(schema),
  });
  const audioInputs = audioDevices.filter(
    (device) => device.direction === AudioDirection.Input,
  );
  const audioOutputs = audioDevices.filter(
    (device) => device.direction === AudioDirection.Output,
  );
  const cameras = CAMERA_FIXTURES.filter(
    (camera) => camera.status === CameraStatus.Available,
  );
  const inputVolume = useWatch({ control, name: "inputVolume" });

  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="font-[family-name:var(--font-geist)] text-xl font-semibold">
        {profile ? messages.form.editTitle : messages.form.createTitle}
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        {messages.form.description}
      </p>

      <form
        className="mt-6 grid gap-5"
        noValidate
        onSubmit={handleSubmit(onSave)}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            {messages.form.name}
            <input
              aria-describedby={errors.name ? "profile-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              className={FIELD_CLASSES}
              placeholder={messages.form.namePlaceholder}
              {...register("name")}
            />
            {errors.name ? (
              <span className="text-xs text-red-700 dark:text-red-300" id="profile-name-error">
                {errors.name.message}
              </span>
            ) : null}
          </label>

          <label className="grid gap-2 text-sm font-medium">
            {messages.form.profileDescription}
            <input
              aria-describedby={
                errors.description ? "profile-description-error" : undefined
              }
              aria-invalid={Boolean(errors.description)}
              className={FIELD_CLASSES}
              placeholder={messages.form.descriptionPlaceholder}
              {...register("description")}
            />
            {errors.description ? (
              <span
                className="text-xs text-red-700 dark:text-red-300"
                id="profile-description-error"
              >
                {errors.description.message}
              </span>
            ) : null}
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium">
            {messages.form.audioInput}
            <select className={FIELD_CLASSES} {...register("audioInputId")}>
              {audioInputs.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {messages.form.audioOutput}
            <select className={FIELD_CLASSES} {...register("audioOutputId")}>
              {audioOutputs.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {messages.form.camera}
            <select className={FIELD_CLASSES} {...register("cameraId")}>
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          <span className="flex justify-between gap-4">
            {messages.form.inputVolume}
            <span className="font-[family-name:var(--font-commit-mono)] text-xs text-zinc-500">
              {inputVolume}%
            </span>
          </span>
          <input
            aria-describedby={
              errors.inputVolume ? "profile-volume-error" : undefined
            }
            aria-invalid={Boolean(errors.inputVolume)}
            className="h-2 w-full cursor-pointer accent-zinc-950 dark:accent-zinc-50"
            max={100}
            min={0}
            type="range"
            {...register("inputVolume", { valueAsNumber: true })}
          />
          {errors.inputVolume ? (
            <span className="text-xs text-red-700 dark:text-red-300" id="profile-volume-error">
              {errors.inputVolume.message}
            </span>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-5">
          <label className="inline-flex min-h-11 items-center gap-3 text-sm font-medium">
            <input
              className="size-4 accent-zinc-950 dark:accent-zinc-50"
              type="checkbox"
              {...register("microphonesMuted")}
            />
            {messages.form.microphonesMuted}
          </label>
          <label className="inline-flex min-h-11 items-center gap-3 text-sm font-medium">
            <input
              className="size-4 accent-zinc-950 dark:accent-zinc-50"
              type="checkbox"
              {...register("cameraEnabled")}
            />
            {messages.form.cameraEnabled}
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-5 dark:border-white/[0.08]">
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            variant={ButtonVariant.Ghost}
          >
            {messages.form.cancel}
          </Button>
          <Button
            loading={true}
            loadingLabel={messages.form.saving}
            className={isSubmitting ? "" : "hidden"}
            type="submit"
          >
            {profile ? messages.form.update : messages.form.create}
          </Button>
          {isSubmitting ? null : (
            <Button type="submit">
              {profile ? messages.form.update : messages.form.create}
            </Button>
          )}
        </div>
      </form>
    </Panel>
  );
}
