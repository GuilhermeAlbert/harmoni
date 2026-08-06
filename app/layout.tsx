import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { commitMono, geist, inter } from "./fonts";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language";
import { ThemeProvider } from "@/contexts/theme";
import { EN_MESSAGES } from "@/lib/i18n/messages/en";

export const metadata: Metadata = {
  title: EN_MESSAGES.metadata.title,
  description: EN_MESSAGES.metadata.description,
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
        <LanguageProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
