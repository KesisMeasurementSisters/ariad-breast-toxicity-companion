import type { Metadata } from "next";
import type { ReactNode } from "react";
import { activeRelease } from "@/lib/release";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ariad: Breast | Treatment side-effect information",
  description: "Draft information about breast cancer treatment side effects. This demo is not for patient care.",
  formatDetection: { address: false, email: false, telephone: false },
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
