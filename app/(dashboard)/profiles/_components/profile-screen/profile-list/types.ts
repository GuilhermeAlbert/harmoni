import type { Messages } from "@/lib/types/messages";
import type { Profile, ProfileApplicationResult } from "@/lib/types/profile";

export interface ProfileListProps {
  messages: Messages["profiles"];
  onApply: (profileId: string) => Promise<void>;
  onEdit: (profileId: string) => void;
  outcomes: Readonly<Record<string, ProfileApplicationResult>>;
  pendingId?: string;
  profiles: readonly Profile[];
}
