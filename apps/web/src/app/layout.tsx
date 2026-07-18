import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ariad: Breast — A trusted thread through treatment",
  description:
    "A breast cancer treatment side-effect companion built as an unreviewed OpenAI Build Week prototype.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

