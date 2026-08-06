import type { PropsWithChildren } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard";
import { NativeAgentProvider } from "@/contexts/native-agent";

export default function Layout({
  children,
}: PropsWithChildren): React.ReactNode {
  return (
    <NativeAgentProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </NativeAgentProvider>
  );
}
