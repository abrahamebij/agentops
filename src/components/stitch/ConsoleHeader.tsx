"use client";

import Image from "next/image";
import { MdSearch, MdNotifications } from "react-icons/md";

export function ConsoleHeader() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <MdSearch className="text-outline text-xl" />
        <span className="text-on-surface-variant font-mono-data text-mono-data">
          system_v3.2.1-stable
        </span>
      </div>
      <div className="flex items-center gap-6">
        <MdNotifications className="text-on-surface-variant text-xl cursor-pointer hover:text-on-surface transition-colors" />
        <div className="relative w-auto h-auto rounded-full overflow-hidden ring-1 ring-outline-variant">
          <Image
            src="/avatar.png"
            width={32}
            height={32}
            alt="Profile"
            className="object-cover w-8 h-8"
          />
        </div>
      </div>
    </header>
  );
}
