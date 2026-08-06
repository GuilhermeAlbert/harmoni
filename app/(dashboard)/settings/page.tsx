import packageMetadata from "@/package.json";

import { SettingsScreen } from "./_components/settings-screen";

export default function SettingsPage(): React.ReactNode {
  return <SettingsScreen appVersion={packageMetadata.version} />;
}
