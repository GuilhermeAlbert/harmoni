import { ProfileCard } from "../../profile-card";
import type { ProfileListProps } from "./types";

export function ProfileList({
  messages,
  onApply,
  onEdit,
  outcomes,
  pendingId,
  profiles,
}: ProfileListProps): React.ReactNode {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          messages={messages}
          onApply={onApply}
          onEdit={onEdit}
          outcome={outcomes[profile.id]}
          pending={pendingId === profile.id}
          profile={profile}
        />
      ))}
    </div>
  );
}
