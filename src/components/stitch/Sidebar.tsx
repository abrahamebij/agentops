"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "DASHBOARD", path: "/dashboard", icon: "dashboard" },
    { name: "AGENTS", path: "/agents", icon: "smart_toy" },
    { name: "POLICIES", path: "/policies", icon: "policy" },
    { name: "EXECUTIONS", path: "/audit-trail", icon: "terminal" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-outline-variant/30 bg-surface-container-lowest z-50 flex flex-col">
      <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
        <Link
          href="/"
          className="font-headline-md text-headline-md text-primary tracking-tight hover:opacity-90 transition-opacity"
        >
          AgentOps
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center px-4 py-3 border-l-2 transition-all font-label-caps text-label-caps ${
                isActive
                  ? "bg-surface-container-high text-on-surface border-primary font-semibold"
                  : "border-transparent text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-6 border-t border-outline-variant/30">
        <Link
          href="/"
          className={`flex items-center px-4 py-3 border-l-2 border-transparent text-on-surface-variant hover:bg-surface-container-low transition-all font-label-caps text-label-caps`}
        >
          <span className="material-symbols-outlined mr-3">settings</span>
          OVERVIEW
        </Link>
      </div>
    </aside>
  );
}
