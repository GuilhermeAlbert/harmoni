import type { Messages } from "@/lib/types/messages";
import type { Profile } from "@/lib/types/profile";

export interface ProfileCardProps {
  messages: Messages["profiles"];
  onApply: (profileId: string) => void;
  onEdit: (profileId: string) => void;
  profile: Profile;
}
