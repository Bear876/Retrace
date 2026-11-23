import React from 'react';

interface TopBarProps {
  onTrySample: () => void;
}

export function TopBar({ onTrySample }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-4 py-3 sm:px-6">
        <a
          href="#top"
          className="font-serif text-xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
        >
          Retrace
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm text-zinc-600"
        >
          <a
            href="#workspace"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Workbench
          </a>
          <a
            href="#checklist"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Checklist
          </a>
          <a
            href="#scoring"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Scoring
          </a>
          <a
            href="#limits"
            className="hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Limits
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTrySample}
            className="rounded-xs border border-zinc-300 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Try a sample
          </button>
        </div>
      </div>
    </header>
  );
}
