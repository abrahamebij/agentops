"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="h-16 max-w-container-max mx-auto px-margin-page flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-headline-md text-headline-md tracking-tight text-on-surface hover:opacity-90 transition-opacity">
            AgentOps
          </Link>
        </div>
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className={`font-label-caps text-label-caps transition-colors ${
              pathname === "/" ? "text-on-surface font-semibold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            OVERVIEW
          </Link>
          <Link
            href="/system-orientation"
            className={`font-label-caps text-label-caps transition-colors ${
              pathname === "/system-orientation" ? "text-on-surface font-semibold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            ONBOARDING
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-label-caps hover:bg-primary-container transition-colors"
          >
            LAUNCH CONSOLE
          </Link>
        </nav>
      </div>
    </header>
  );
}
