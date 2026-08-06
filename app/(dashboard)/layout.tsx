import type { PropsWithChildren } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard";
import { AudioDevicesProvider } from "@/contexts/audio-devices";
import { CamerasProvider } from "@/contexts/cameras";
import { NativeAgentProvider } from "@/contexts/native-agent";
import { PeripheralsProvider } from "@/contexts/peripherals";

export default function Layout({
  children,
}: PropsWithChildren): React.ReactNode {
  return (
    <NativeAgentProvider>
      <AudioDevicesProvider>
        <CamerasProvider>
          <PeripheralsProvider><DashboardLayout>{children}</DashboardLayout></PeripheralsProvider>
        </CamerasProvider>
      </AudioDevicesProvider>
    </NativeAgentProvider>
  );
}
