import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PortalShell } from "@/components/portal-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.logindustries.com"),
  title: "LogIndustries | Industrial Ecommerce Store",
  description: "Premium industrial tools, safety gear, and supply products built with Next.js.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900">
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
