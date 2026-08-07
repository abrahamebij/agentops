"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdDashboard, MdSmartToy, MdPolicy, MdTerminal, MdPerson, MdSettings, MdLogout } from "react-icons/md";
import { IconType } from "react-icons";

interface NavItem {
  name: string;
  path: string;
  Icon: IconType;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    { name: "DASHBOARD", path: "/dashboard", Icon: MdDashboard },
    { name: "AGENTS", path: "/agents", Icon: MdSmartToy },
    { name: "POLICIES", path: "/policies", Icon: MdPolicy },
    { name: "EXECUTIONS", path: "/executions", Icon: MdTerminal },
    { name: "PROFILE", path: "/profile", Icon: MdPerson },
  ];

  const handleLogout = () => {
    localStorage.removeItem("agentops_user_session");
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-outline-variant/30 bg-surface-container-lowest z-50 flex flex-col">
      <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <img src="/logo.png" alt="AgentOps Logo" className="h-7 w-auto object-contain" />
          <span className="font-headline-md text-headline-md text-primary tracking-tight">
            AgentOps
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(item.path));
          const Icon = item.Icon;
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
              <Icon className="mr-3 text-lg" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-outline-variant/30 flex flex-col gap-1">
        <Link
          href="/about"
          className={`flex items-center px-4 py-2.5 border-l-2 ${
            pathname === "/about"
              ? "bg-surface-container-high text-on-surface border-primary font-semibold"
              : "border-transparent text-on-surface-variant hover:bg-surface-container-low"
          } transition-all font-label-caps text-label-caps text-xs`}
        >
          <MdSettings className="mr-3 text-lg" />
          ABOUT
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2.5 border-l-2 border-transparent text-error/80 hover:text-error hover:bg-error/10 transition-all font-label-caps text-label-caps text-xs text-left"
        >
          <MdLogout className="mr-3 text-lg shrink-0" />
          LOG OUT
        </button>
      </div>
    </aside>
  );
}

