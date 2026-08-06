import type { Messages } from "@/lib/types/messages";
import type { Profile, ProfileApplicationResult } from "@/lib/types/profile";

export interface ProfileCardProps {
  messages: Messages["profiles"];
  onApply: (profileId: string) => Promise<void>;
  onEdit: (profileId: string) => void;
  profile: Profile;
  pending: boolean;
  outcome?: ProfileApplicationResult;
}
