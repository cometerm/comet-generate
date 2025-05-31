import { ReactScan } from "@/lib/react-scan";
import "./globals.css";
import { funnSans, jetBrainsMono, instrumentSerif } from "./fonts";

export const metadata = {
  title: "Better Curr",
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
        className={`${funnSans.variable} ${jetBrainsMono.variable} ${instrumentSerif.variable} antialiased bg-neutral-950`}
      >
        {children}
      </body>
    </html>
  );
}
