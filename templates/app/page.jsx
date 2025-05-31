"use client";

export default function Page() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col p-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl text-center space-y-8">
          <h1 className="text-6xl font-serif text-neutral-300 tracking-tight">
            Better Curr
          </h1>

          <code className="inline-block px-6 py-3 bg-neutral-900 text-lime-300 rounded font-mono text-lg">
            bunx create-better-curr@latest
          </code>

          <div className="max-w-2xl mx-auto">
            <p className="text-md text-neutral-400 leading-relaxed">
              Generate complete TypeScript projects with pre-configured
              templates, and industry-standard best practices. Get your
              development environment ready in seconds, not hours. Read the{" "}
              <a
                href="https://test-cli-scaffolding-tool.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime-300 hover:underline"
              >
                documentation
              </a>{" "}
              or browse the{" "}
              <a
                href="https://github.com/armancurr/cli-scaffolding-tool.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime-300 hover:underline"
              >
                source code
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
