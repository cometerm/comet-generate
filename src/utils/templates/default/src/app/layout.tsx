import { ReactScan } from "@/lib/react-scan";
import type { Metadata } from "next";
import { funnelSans, instrumentSerif, geistMono } from "./fonts";
import SessionProvider from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comet Press - Click Speed Test",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  description: "Test your click speed and improve your skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ReactScan />
      <body
        className={`${funnelSans.variable} ${instrumentSerif.variable} ${geistMono.variable} antialiased bg-indigo-300`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
