import type { ProfileFormValues } from "./schema";
import type { Messages } from "@/lib/types/messages";
import type { Profile } from "@/lib/types/profile";

export interface ProfileFormProps {
  messages: Messages["profiles"];
  onCancel: () => void;
  onSave: (values: ProfileFormValues) => Promise<void>;
  profile?: Profile;
}
