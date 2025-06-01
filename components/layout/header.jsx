"use client";
import { Button } from "@/components/ui/button";
import GithubSVG from "@/components/layout/github-svg";

export default function Header() {
  return (
    <div className="bg-transparent">
      <div className="container mx-auto flex flex-col items-center justify-center px-6 py-6">
        <Button
          variant="secondary"
          className="flex items-center gap-2 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 transition-colors duration-200 mb-2"
          asChild
        >
          <a
            href="https://github.com/armancurr/cli-scaffolding-tool.git"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubSVG className="h-5 w-5" />
            Source Code
          </a>
        </Button>
        <p className="text-xs text-neutral-400 text-center max-w-md">
          If you find this tool helpful, please consider starring the GitHub
          repo to keep it open source! Your support helps us improve the tool
          for everyone.
        </p>
      </div>
    </div>
  );
}
