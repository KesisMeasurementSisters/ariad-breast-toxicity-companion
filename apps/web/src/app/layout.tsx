import type { Metadata } from "next";
import type { ReactNode } from "react";
import { activeRelease } from "@/lib/release";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ariad: Breast — A trusted thread through treatment",
  description:
    "A breast cancer treatment side-effect companion built as an unreviewed OpenAI Build Week prototype.",
  robots:
    activeRelease.channel === "preview"
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
