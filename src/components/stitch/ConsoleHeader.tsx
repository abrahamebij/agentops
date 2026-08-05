"use client";

import { useState, useEffect } from "react";
import { MdSearch, MdNotifications } from "react-icons/md";

export function ConsoleHeader() {
  const [userSession, setUserSession] = useState<{
    fullName: string;
    avatarUrl: string;
    walletAddress: string;
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("agentops_user_session");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUserSession(parsed);
      } catch (err) {
        console.error("Failed to parse console header session:", err);
      }
    }
  }, []);

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
        {userSession ? (
          <div className="flex items-center gap-3 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30">
            <div className="w-7 h-7 rounded-full bg-primary/20 overflow-hidden flex items-center justify-center border border-primary/40">
              {userSession.avatarUrl ? (
                <img src={userSession.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono-data text-[10px] text-primary font-bold">
                  {userSession.fullName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-mono-data text-xs font-semibold text-on-surface">
                {userSession.fullName}
              </span>
              <span className="font-mono-data text-[10px] text-on-surface-variant">
                {userSession.walletAddress.slice(0, 6)}...{userSession.walletAddress.slice(-4)}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-mono-data text-xs text-on-surface-variant">
            OP
          </div>
        )}
      </div>
    </header>
  );
}
