import type { PropsWithChildren } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard";

export default function Layout({
  children,
}: PropsWithChildren): React.ReactNode {
  return <DashboardLayout>{children}</DashboardLayout>;
}

