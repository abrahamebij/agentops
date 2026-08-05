"use client";

import { useState, useEffect } from "react";
import { MdSearch, MdNotifications } from "react-icons/md";

export function ConsoleHeader() {
  const [userSession, setUserSession] = useState<{
    fullName: string;
    avatarUrl: string;
    walletAddress: string;
  } | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLiveProfile() {
      const raw = localStorage.getItem("agentops_user_session");
      if (!raw) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        // Set local session immediately so UI isn't blank
        setUserSession({
          fullName: parsed.fullName || "",
          avatarUrl: parsed.avatarUrl || "",
          walletAddress: parsed.walletAddress || "",
        });

        // Then fetch live profile from Supabase DB to get the real data
        if (parsed.walletAddress) {
          const res = await fetch(`/api/auth/profile?walletAddress=${parsed.walletAddress}`);
          const data = await res.json();
          if (data.exists && data.profile) {
            const liveProfile = {
              fullName: data.profile.fullName || parsed.fullName || "",
              avatarUrl: data.profile.avatarUrl || parsed.avatarUrl || "",
              walletAddress: data.profile.walletAddress || parsed.walletAddress,
            };
            setUserSession(liveProfile);

            // Keep localStorage in sync with live data
            const existing = JSON.parse(raw);
            localStorage.setItem(
              "agentops_user_session",
              JSON.stringify({ ...existing, ...liveProfile })
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch live profile in ConsoleHeader:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveProfile();
  }, []);

  const displayName = userSession?.fullName || "";
  const displayAddress = userSession?.walletAddress
    ? `${userSession.walletAddress.slice(0, 6)}...${userSession.walletAddress.slice(-4)}`
    : "";

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : displayAddress
    ? displayAddress.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <MdSearch className="text-outline text-xl" />
        <span className="text-on-surface-variant font-mono-data text-mono-data">
          system_v3.2.1-stable
        </span>
      </div>
      <div className="flex items-center gap-4">
        <MdNotifications className="text-on-surface-variant text-xl cursor-pointer hover:text-on-surface transition-colors" />

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex items-center gap-3 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-surface-container-high shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-20 bg-surface-container-high rounded" />
              <div className="h-2 w-14 bg-surface-container-high rounded" />
            </div>
          </div>
        ) : userSession ? (
          <div className="flex items-center gap-3 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30">
            <div className="w-7 h-7 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center border border-primary/40 shrink-0">
              {userSession.avatarUrl && !imageError ? (
                <img
                  src={userSession.avatarUrl}
                  alt="Avatar"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-mono-data text-[10px] text-primary font-bold">
                  {initials}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-mono-data text-xs font-semibold text-on-surface truncate max-w-[120px]">
                {displayName || displayAddress}
              </span>
              {displayAddress && displayName && (
                <span className="font-mono-data text-[10px] text-on-surface-variant">
                  {displayAddress}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-mono-data text-xs text-on-surface-variant">
            --
          </div>
        )}
      </div>
    </header>
  );
}
