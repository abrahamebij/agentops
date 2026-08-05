"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { OnboardingModal } from "./Auth/OnboardingModal";
import { MdMenu, MdClose } from "react-icons/md";

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<{
    fullName: string;
    avatarUrl: string;
    walletAddress: string;
    isAuthenticated: boolean;
  } | null>(null);

  const loadLiveSession = async () => {
    const raw = localStorage.getItem("agentops_user_session");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.isAuthenticated) {
        setUserSession(parsed);

        // Fetch live from DB by wallet address
        if (parsed.walletAddress) {
          const res = await fetch(`/api/auth/profile?walletAddress=${parsed.walletAddress}`);
          const data = await res.json();
          if (data.exists && data.profile) {
            setUserSession({
              fullName: data.profile.fullName || parsed.fullName || "",
              avatarUrl: data.profile.avatarUrl || parsed.avatarUrl || "",
              walletAddress: data.profile.walletAddress || parsed.walletAddress,
              isAuthenticated: true,
            });
          }
        }
      }
    } catch (err) {
      console.error("Session parse error:", err);
    }
  };

  useEffect(() => {
    loadLiveSession();

    const handleOpenOnboarding = () => setIsModalOpen(true);
    window.addEventListener("open-onboarding", handleOpenOnboarding);
    return () => window.removeEventListener("open-onboarding", handleOpenOnboarding);
  }, []);

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (userSession?.isAuthenticated) {
      router.push("/dashboard");
    } else {
      setIsModalOpen(true);
    }
  };

  const displayName = userSession?.fullName || userSession?.walletAddress
    ? (userSession?.fullName || `${userSession?.walletAddress?.slice(0, 6)}...${userSession?.walletAddress?.slice(-4)}`)
    : "";

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="h-16 max-w-container-max mx-auto px-margin-page flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-headline-md text-headline-md tracking-tight text-on-surface hover:opacity-90 transition-opacity"
            >
              AgentOps
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/about"
              className={`font-label-caps text-label-caps transition-colors ${
                pathname === "/about" ? "text-on-surface font-semibold" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              ABOUT
            </Link>

            {userSession?.isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-full border border-outline-variant/30 text-on-surface transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center border border-primary/40 shrink-0">
                    {userSession.avatarUrl && !imageError ? (
                      <img
                        src={userSession.avatarUrl}
                        alt="Avatar"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-mono-data text-[10px] text-primary font-bold">
                        {displayName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-mono-data text-xs">{displayName}</span>
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="flex md:hidden p-2 text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface-container border-b border-outline-variant/40 px-6 py-6 flex flex-col gap-5 shadow-2xl animate-in slide-in-from-top duration-200">
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`font-label-caps text-label-caps py-2 text-base transition-colors ${
                pathname === "/about" ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              ABOUT
            </Link>

            {userSession?.isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl border border-outline-variant/30 text-on-surface"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center border border-primary/40 shrink-0">
                  {userSession.avatarUrl && !imageError ? (
                    <img
                      src={userSession.avatarUrl}
                      alt="Avatar"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono-data text-xs text-primary font-bold">
                      {displayName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono-data text-xs font-semibold">{displayName}</span>
                  <span className="font-label-caps text-[10px] text-primary">OPEN CONSOLE &rarr;</span>
                </div>
              </Link>
            ) : (
              <button
                onClick={handleLaunchClick}
                className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-label-caps text-label-caps font-semibold shadow-lg text-center"
              >
                LAUNCH CONSOLE
              </button>
            )}
          </div>
        )}
      </header>

      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadLiveSession();
        }}
      />
    </>
  );
}
