"use client";

import Image from "next/image";

export function ConsoleHeader() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-outline">search</span>
        <span className="text-on-surface-variant font-mono-data text-mono-data">
          system_v3.2.1-stable
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors">
          notifications
        </span>
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-outline-variant">
          <Image
            src="/assets/stitch/shared/avatar.jpg"
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
}
