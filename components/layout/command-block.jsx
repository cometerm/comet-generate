"use client";
import { Button } from "@/components/ui/button";
import { Clipboard, Check } from "@phosphor-icons/react";

export default function CommandBlock({ command, id, copied, onCopy }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 bg-neutral-900 rounded-md">
      <code className="flex-1 text-lime-300 font-mono text-md">{command}</code>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCopy(command, id)}
        className="text-neutral-300 hover:text-lime-300 hover:bg-neutral-800 cursor-pointer"
      >
        {copied ? (
          <Check weight="bold" size={20} />
        ) : (
          <Clipboard weight="bold" size={20} />
        )}
      </Button>
    </div>
  );
}
