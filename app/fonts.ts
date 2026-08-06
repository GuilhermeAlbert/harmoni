import localFont from "next/font/local";

export const geist = localFont({
  display: "swap",
  src: "../public/fonts/geist-variable.ttf",
  variable: "--font-geist",
  weight: "100 900",
});

export const inter = localFont({
  display: "swap",
  src: "../public/fonts/inter-variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
});

export const commitMono = localFont({
  display: "swap",
  src: "../public/fonts/commit-mono.woff2",
  variable: "--font-commit-mono",
  weight: "200 700",
});

