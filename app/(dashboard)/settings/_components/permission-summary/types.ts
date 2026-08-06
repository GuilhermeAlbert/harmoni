import type { SettingsFixtureState } from "@/lib/enums/settings-fixture-state";
import type { Messages } from "@/lib/types/messages";
import type { Permission } from "@/lib/types/permission";

export interface PermissionSummaryProps {
  fixtureState: SettingsFixtureState;
  messages: Messages["settingsScreen"];
  permissions: readonly Permission[];
}
