import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { commitMono, geist, inter } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme";

export const metadata: Metadata = {
  title: "Harmoni",
  description: "Centralized device and peripheral management for macOS.",
};

export default function RootLayout({
  children,
}: PropsWithChildren): React.ReactNode {
  return (
    <html
      className={`${geist.variable} ${inter.variable} ${commitMono.variable} scheme-light dark:scheme-dark`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="font-[family-name:var(--font-inter)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
