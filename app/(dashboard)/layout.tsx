import type { PropsWithChildren } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard";
import { AudioDevicesProvider } from "@/contexts/audio-devices";
import { NativeAgentProvider } from "@/contexts/native-agent";

export default function Layout({
  children,
}: PropsWithChildren): React.ReactNode {
  return (
    <NativeAgentProvider>
      <AudioDevicesProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </AudioDevicesProvider>
    </NativeAgentProvider>
  );
}
