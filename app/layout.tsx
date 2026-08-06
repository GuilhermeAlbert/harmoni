import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Harmoni",
  description: "Centralized device and peripheral management for macOS.",
};

export default function RootLayout({
  children,
}: PropsWithChildren): React.ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
