import type { PropsWithChildren } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard";
import { AudioDevicesProvider } from "@/contexts/audio-devices";
import { CamerasProvider } from "@/contexts/cameras";
import { NativeAgentProvider } from "@/contexts/native-agent";

export default function Layout({
  children,
}: PropsWithChildren): React.ReactNode {
  return (
    <NativeAgentProvider>
      <AudioDevicesProvider>
        <CamerasProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </CamerasProvider>
      </AudioDevicesProvider>
    </NativeAgentProvider>
  );
}
