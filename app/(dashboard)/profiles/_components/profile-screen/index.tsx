"use client";

import { useEffect, useState } from "react";
import { Info, Plus } from "lucide-react";
import { ProfileCard } from "../profile-card";
import { ProfileForm } from "../profile-form";
import type { ProfileFormValues } from "../profile-form/schema";
import { Button } from "@/components/button";
import { Panel } from "@/components/panel";
import { useLanguage } from "@/contexts/language/use-language";
import { useAudioDevices } from "@/contexts/audio-devices/use-audio-devices";
import { useCameras } from "@/contexts/cameras/use-cameras";
import { ProfileOrigin } from "@/lib/enums/profile-origin";
import { applyProfile, exportProfilesRecoveryCopy, getProfiles, saveProfile } from "@/lib/services/profiles";
import type { Profile, ProfileApplicationResult } from "@/lib/types/profile";

interface ProfileEditorState { profileId?: string }

export function ProfileScreen(): React.ReactNode {
  const [editor, setEditor] = useState<ProfileEditorState | null>(null);
  const [feedback, setFeedback] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [pendingId, setPendingId] = useState<string>();
  const [outcomes, setOutcomes] = useState<Record<string, ProfileApplicationResult>>({});
  const { messages } = useLanguage();
  const { refresh: refreshAudio } = useAudioDevices();
  const { refresh: refreshCameras } = useCameras();
  const profileMessages = messages.profiles;
  const editingProfile = editor?.profileId ? profiles.find((profile) => profile.id === editor.profileId) : undefined;

  useEffect(() => { void getProfiles().then(setProfiles).catch(() => { setStorageError(true); setFeedback(profileMessages.feedback.loadFailed); }).finally(() => setLoading(false)); }, [profileMessages.feedback.loadFailed]);

  const handleApply = async (profileId: string): Promise<void> => {
    setPendingId(profileId); setFeedback("");
    try { const result = await applyProfile(profileId); setProfiles(result.profiles); setOutcomes((current) => ({ ...current, [profileId]: result })); refreshAudio(); refreshCameras(); setFeedback(result.fullyApplied ? profileMessages.feedback.applied : profileMessages.feedback.partial); }
    catch { setFeedback(profileMessages.feedback.applyFailed); }
    finally { setPendingId(undefined); }
  };

  const handleSave = async (values: ProfileFormValues): Promise<void> => {
    const profile: Profile = { active: false, description: values.description, id: editingProfile?.id ?? crypto.randomUUID(), name: values.name, origin: ProfileOrigin.Local, preferences: { audioInputId: values.audioInputId || undefined, setAudioInputDefault: values.setAudioInputDefault, audioOutputId: values.audioOutputId || undefined, cameraId: values.cameraId || undefined, inputVolume: values.applyInputVolume ? values.inputVolume : undefined, microphonesMuted: values.applyMicrophoneMute ? values.microphonesMuted : undefined, stopCameraPreview: values.stopCameraPreview } };
    const next = await saveProfile(profile); setProfiles(next); setFeedback(editingProfile ? profileMessages.feedback.updated : profileMessages.feedback.created); setEditor(null);
  };

  return <main className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end"><div className="max-w-3xl"><p className="font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">{profileMessages.eyebrow}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{profileMessages.title}</h2><p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{profileMessages.description}</p></div><Button disabled={storageError} onClick={() => setEditor({})}><Plus aria-hidden="true" className="size-4" />{profileMessages.createProfile}</Button></div>
    <Panel className="mt-6 flex items-start gap-3 p-4"><Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-zinc-500"/><p className="text-sm text-zinc-600 dark:text-zinc-400">{profileMessages.sessionOnly}</p></Panel>
    <p aria-live="polite" className="mt-4 min-h-5 text-sm font-medium" role="status">{loading ? profileMessages.loading : feedback}</p>
    {storageError ? <Panel className="mt-4 p-5" role="alert"><p className="text-sm font-semibold">{profileMessages.storageErrorTitle}</p><p className="mt-2 text-sm text-zinc-500">{profileMessages.storageErrorDescription}</p><Button className="mt-4" onClick={() => void exportProfilesRecoveryCopy().then((path) => setFeedback(`${profileMessages.feedback.recoverySaved} ${path}`)).catch(() => setFeedback(profileMessages.feedback.recoveryFailed))}>{profileMessages.exportRecovery}</Button></Panel> : null}
    {editor ? <div className="mt-4"><ProfileForm key={editor.profileId ?? "new"} messages={profileMessages} onCancel={() => setEditor(null)} onSave={handleSave} profile={editingProfile}/></div> : null}
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{profiles.map((profile) => <ProfileCard key={profile.id} messages={profileMessages} onApply={handleApply} onEdit={(profileId) => setEditor({ profileId })} outcome={outcomes[profile.id]} pending={pendingId === profile.id} profile={profile}/>)}</div>
  </div></main>;
}
