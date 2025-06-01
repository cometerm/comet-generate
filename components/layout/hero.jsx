"use client";
import CommandBlock from "@/components/layout/command-block";

export default function Hero({ copiedStates, copyToClipboard }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-transparent" />
      <div className="relative max-w-7xl mx-auto px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-serif text-neutral-100 tracking-tight">
              Better
              <em>Curr</em>
            </h1>
            <p className="text-md md:text-md text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              The modern CLI tool that scaffolds production-ready, typesafe
              Next.js projects in seconds. Instantly set up pre-written
              boilerplate for both frontend and backend apps, with built-in
              support for popular databases like MongoDB or SQL solutions such
              as Postgres.
            </p>
          </div>

          <div className="flex flex-col gap-6 items-center max-w-2xl mx-auto">
            <CommandBlock
              command="bunx create-better-curr@latest"
              id="hero-command"
              copied={copiedStates["hero-command"]}
              onCopy={copyToClipboard}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
