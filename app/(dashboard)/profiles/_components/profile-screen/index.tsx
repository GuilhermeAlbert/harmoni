"use client";

import { useState } from "react";
import { Info, Plus } from "lucide-react";

import { ProfileCard } from "../profile-card";
import { ProfileForm } from "../profile-form";
import type { ProfileFormValues } from "../profile-form/schema";
import { Badge } from "@/components/badge";
import { BadgeTone } from "@/components/badge/enums";
import { Button } from "@/components/button";
import { Panel } from "@/components/panel";
import { useLanguage } from "@/contexts/language/use-language";
import { PROFILE_FIXTURES } from "@/lib/constants/profile-fixtures";
import { ProfileOrigin } from "@/lib/enums/profile-origin";
import type { Profile } from "@/lib/types/profile";

const PROFILE_SAVE_DELAY_MS = 350;

interface ProfileEditorState {
  profileId?: string;
}

function copyProfileFixtures(): Profile[] {
  return PROFILE_FIXTURES.map((profile): Profile => ({
    ...profile,
    preferences: { ...profile.preferences },
  }));
}

export function ProfileScreen(): React.ReactNode {
  const [editor, setEditor] = useState<ProfileEditorState | null>(null);
  const [feedback, setFeedback] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>(copyProfileFixtures);
  const { messages } = useLanguage();
  const profileMessages = messages.profiles;
  const editingProfile = editor?.profileId
    ? profiles.find((profile) => profile.id === editor.profileId)
    : undefined;

  const handleApply = (profileId: string): void => {
    setProfiles((currentProfiles) =>
      currentProfiles.map((profile) => ({
        ...profile,
        active: profile.id === profileId,
      })),
    );
    setFeedback(profileMessages.feedback.applied);
  };

  const handleSave = async (values: ProfileFormValues): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, PROFILE_SAVE_DELAY_MS));

    if (editingProfile) {
      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.id === editingProfile.id
            ? {
                ...profile,
                description: values.description,
                name: values.name,
                origin: ProfileOrigin.Session,
                preferences: {
                  audioInputId: values.audioInputId,
                  audioOutputId: values.audioOutputId,
                  cameraEnabled: values.cameraEnabled,
                  cameraId: values.cameraId,
                  inputVolume: values.inputVolume,
                  microphonesMuted: values.microphonesMuted,
                },
                preset: undefined,
              }
            : profile,
        ),
      );
      setFeedback(profileMessages.feedback.updated);
    } else {
      const nextProfileNumber = profiles.length + 1;
      const newProfile: Profile = {
        active: false,
        description: values.description,
        id: `session-profile-${nextProfileNumber}`,
        name: values.name,
        origin: ProfileOrigin.Session,
        preferences: {
          audioInputId: values.audioInputId,
          audioOutputId: values.audioOutputId,
          cameraEnabled: values.cameraEnabled,
          cameraId: values.cameraId,
          inputVolume: values.inputVolume,
          microphonesMuted: values.microphonesMuted,
        },
      };

      setProfiles((currentProfiles) => [...currentProfiles, newProfile]);
      setFeedback(profileMessages.feedback.created);
    }

    setEditor(null);
  };

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <Badge tone={BadgeTone.Warning}>{profileMessages.fixtureLabel}</Badge>
            <p className="mt-4 font-[family-name:var(--font-commit-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {profileMessages.eyebrow}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-geist)] text-3xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-4xl">
              {profileMessages.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {profileMessages.description}
            </p>
          </div>
          <Button onClick={() => setEditor({})}>
            <Plus aria-hidden="true" className="size-4" />
            {profileMessages.createProfile}
          </Button>
        </div>

        <Panel className="mt-6 flex items-start gap-3 p-4">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-zinc-500" />
          <p className="text-sm leading-5 text-zinc-600 dark:text-zinc-400">
            {profileMessages.sessionOnly}
          </p>
        </Panel>

        <p
          aria-live="polite"
          className="mt-4 min-h-5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
          role="status"
        >
          {feedback}
        </p>

        {editor ? (
          <div className="mt-4">
            <ProfileForm
              key={editor.profileId ?? "new-profile"}
              messages={profileMessages}
              onCancel={() => setEditor(null)}
              onSave={handleSave}
              profile={editingProfile}
            />
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              messages={profileMessages}
              onApply={handleApply}
              onEdit={(profileId) => setEditor({ profileId })}
              profile={profile}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
