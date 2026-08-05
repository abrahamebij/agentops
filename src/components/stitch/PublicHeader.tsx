"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { OnboardingModal } from "./Auth/OnboardingModal";

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<{
    fullName: string;
    avatarUrl: string;
    isAuthenticated: boolean;
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("agentops_user_session");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.isAuthenticated) {
          setUserSession(parsed);
        }
      } catch (err) {
        console.error("Session parse error:", err);
      }
    }

    const handleOpenOnboarding = () => setIsModalOpen(true);
    window.addEventListener("open-onboarding", handleOpenOnboarding);
    return () => window.removeEventListener("open-onboarding", handleOpenOnboarding);
  }, []);

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userSession?.isAuthenticated) {
      router.push("/dashboard");
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
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

            {userSession?.isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-full border border-outline-variant/30 text-on-surface transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center border border-primary/40">
                    {userSession.avatarUrl ? (
                      <img src={userSession.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-mono-data text-[10px] text-primary font-bold">
                        {userSession.fullName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-mono-data text-xs">{userSession.fullName}</span>
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLaunchClick}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-caps text-label-caps hover:bg-primary-container transition-all hover:scale-105 active:scale-95"
              >
                LAUNCH CONSOLE
              </button>
            )}
          </nav>
        </div>
      </header>

      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          const raw = localStorage.getItem("agentops_user_session");
          if (raw) setUserSession(JSON.parse(raw));
        }}
      />
    </>
  );
}
