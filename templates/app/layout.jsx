import { ReactScan } from "@/lib/react-scan";
import "./globals.css";
import { funnSans, geistMono, instrumentSerif } from "./fonts";

export const metadata = {
  title: "Better Curr - CLI scaffolding tool",
  icons: {
    icon: "/converted.png",
    shortcut: "/converted.png",
  },
  description:
    "CLI for scaffolding TypeScript projects. Generate type-safe codebases with customizable templates, best practices, and ready-to-use configs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ReactScan />
      <body
        className={`${funnSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased bg-neutral-950`}
      >
        {children}
      </body>
    </html>
  );
}
