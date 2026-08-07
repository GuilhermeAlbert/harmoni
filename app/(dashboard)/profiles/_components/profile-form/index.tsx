import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { createProfileFormSchema, type ProfileFormValues } from "./schema";
import type { ProfileFormProps } from "./types";
import { Button } from "@/components/button";
import { ButtonVariant } from "@/components/button/enums";
import { DevicePicker } from "@/components/device-picker";
import { Panel } from "@/components/panel";
import { useAudioDevices } from "@/contexts/audio-devices/use-audio-devices";
import { useCameras } from "@/contexts/cameras/use-cameras";
import { AudioDirection } from "@/lib/enums/audio-direction";

const FIELD_CLASSES = "min-h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 aria-invalid:border-red-500 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:outline-white";

export function ProfileForm({ messages, onCancel, onSave, profile }: ProfileFormProps): React.ReactNode {
  const presetMessages = profile?.preset ? messages.presets[profile.preset] : null;
  const { devices } = useAudioDevices();
  const { cameras } = useCameras();
  const inputs = devices.filter((item) => item.direction === AudioDirection.Input && (item.canSetDefault || item.canSetVolume || item.canSetMute));
  const outputs = devices.filter((item) => item.direction === AudioDirection.Output && item.canSetDefault);
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<ProfileFormValues>({
    defaultValues: {
      applyInputVolume: profile?.preferences.inputVolume !== undefined,
      applyMicrophoneMute: profile?.preferences.microphonesMuted !== undefined,
      audioInputId: profile?.preferences.audioInputId ?? "",
      audioOutputId: profile?.preferences.audioOutputId ?? "",
      cameraId: profile?.preferences.cameraId ?? "",
      description: profile?.description ?? presetMessages?.description ?? "",
      inputVolume: profile?.preferences.inputVolume ?? 65,
      microphonesMuted: profile?.preferences.microphonesMuted ?? false,
      name: profile?.name ?? presetMessages?.name ?? "",
      setAudioInputDefault: profile?.preferences.setAudioInputDefault ?? false,
      stopCameraPreview: profile?.preferences.stopCameraPreview ?? false,
    },
    resolver: zodResolver(createProfileFormSchema(messages.form.validation)),
  });
  const inputId = useWatch({ control, name: "audioInputId" });
  const applyVolume = useWatch({ control, name: "applyInputVolume" });
  const applyMute = useWatch({ control, name: "applyMicrophoneMute" });
  const inputVolume = useWatch({ control, name: "inputVolume" });
  const selectedInput = inputs.find((item) => item.id === inputId);
  const deviceOptions = (items: typeof inputs) => items.map((item) => ({ label: item.name, value: item.id }));

  return <Panel className="p-5 sm:p-6">
    <h2 className="text-xl font-semibold">{profile ? messages.form.editTitle : messages.form.createTitle}</h2>
    <p className="mt-2 text-sm text-zinc-500">{messages.form.description}</p>
    <form className="mt-6 grid gap-5" noValidate onSubmit={handleSubmit(onSave)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">{messages.form.name}<input aria-invalid={Boolean(errors.name)} className={FIELD_CLASSES} placeholder={messages.form.namePlaceholder} {...register("name")}/>{errors.name ? <span className="text-xs text-red-600">{errors.name.message}</span> : null}</label>
        <label className="grid gap-2 text-sm font-medium">{messages.form.profileDescription}<input aria-invalid={Boolean(errors.description)} className={FIELD_CLASSES} placeholder={messages.form.descriptionPlaceholder} {...register("description")}/>{errors.description ? <span className="text-xs text-red-600">{errors.description.message}</span> : null}</label>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">{messages.form.audioInput}<Controller control={control} name="audioInputId" render={({ field }) => <DevicePicker label={messages.form.audioInput} onChange={field.onChange} options={deviceOptions(inputs)} placeholder={messages.form.noChange} value={field.value}/>} />{errors.audioInputId ? <span className="text-xs text-red-600">{errors.audioInputId.message}</span> : null}</label>
        <label className="grid gap-2 text-sm font-medium">{messages.form.audioOutput}<Controller control={control} name="audioOutputId" render={({ field }) => <DevicePicker label={messages.form.audioOutput} onChange={field.onChange} options={deviceOptions(outputs)} placeholder={messages.form.noChange} value={field.value}/>} /></label>
        <label className="grid gap-2 text-sm font-medium">{messages.form.camera}<Controller control={control} name="cameraId" render={({ field }) => <DevicePicker label={messages.form.camera} onChange={field.onChange} options={cameras.map((item) => ({ label: item.name, value: item.id }))} placeholder={messages.form.noChange} value={field.value}/>} /></label>
      </div>
      <div className="grid gap-4 rounded-xl border border-zinc-200 p-4 dark:border-white/10">
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium"><input disabled={!selectedInput?.canSetDefault} type="checkbox" {...register("setAudioInputDefault")}/>{messages.form.setAudioInputDefault}</label>
        {!selectedInput || selectedInput.canSetDefault ? null : <p className="text-xs text-zinc-500">{messages.form.defaultUnsupported}</p>}
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium"><input disabled={!selectedInput?.canSetVolume} type="checkbox" {...register("applyInputVolume")}/>{messages.form.applyInputVolume}</label>
        {applyVolume ? <label className="grid gap-2 text-sm font-medium"><span className="flex justify-between">{messages.form.inputVolume}<span>{inputVolume}%</span></span><input className="accent-zinc-950" disabled={!selectedInput?.canSetVolume} max={100} min={0} type="range" {...register("inputVolume", { valueAsNumber: true })}/></label> : null}
        {!selectedInput || selectedInput.canSetVolume ? null : <p className="text-xs text-zinc-500">{messages.form.volumeUnsupported}</p>}
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium"><input disabled={!selectedInput?.canSetMute} type="checkbox" {...register("applyMicrophoneMute")}/>{messages.form.applyMicrophoneMute}</label>
        {applyMute ? <label className="flex min-h-11 items-center gap-3 text-sm"><input disabled={!selectedInput?.canSetMute} type="checkbox" {...register("microphonesMuted")}/>{messages.form.microphonesMuted}</label> : null}
        {!selectedInput || selectedInput.canSetMute ? null : <p className="text-xs text-zinc-500">{messages.form.muteUnsupported}</p>}
        <label className="flex min-h-11 items-center gap-3 text-sm font-medium"><input type="checkbox" {...register("stopCameraPreview")}/>{messages.form.stopCameraPreview}</label>
        <p className="text-xs text-zinc-500">{messages.form.stopCameraPreviewHint}</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-zinc-200 pt-5 dark:border-white/10"><Button disabled={isSubmitting} onClick={onCancel} variant={ButtonVariant.Ghost}>{messages.form.cancel}</Button>{isSubmitting ? <Button loading={true} loadingLabel={messages.form.saving} type="submit">{messages.form.saving}</Button> : <Button type="submit">{profile ? messages.form.update : messages.form.create}</Button>}</div>
    </form>
  </Panel>;
}
