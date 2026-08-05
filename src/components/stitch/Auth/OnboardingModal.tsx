"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { MdAccountBalanceWallet, MdClose } from "react-icons/md";
import { connectViemWallet } from "@/src/lib/web3/viemClient";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OnboardingModal({ isOpen, onClose, onSuccess }: OnboardingModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleViemConnect = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      // 1. Connect real Web3 wallet via Viem client
      const res = await connectViemWallet();

      // 2. Fetch or Auto-Provision profile in Supabase DB immediately
      const profileRes = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: res.address,
          fullName: "Operator",
        }),
      });

      const profileData = await profileRes.json();

      const activeUserId = profileData.userId || res.address;
      const activeFullName = profileData.fullName || "Operator";
      const activeAvatarUrl =
        profileData.avatarUrl ||
        "https://xxqhzuukpxokwxrbteql.supabase.co/storage/v1/object/public/avatars/operator-avatar.png";

      // 3. Save session locally
      localStorage.setItem(
        "agentops_user_session",
        JSON.stringify({
          userId: activeUserId,
          walletAddress: res.address,
          fullName: activeFullName,
          avatarUrl: activeAvatarUrl,
          isAuthenticated: true,
        })
      );

      if (onSuccess) onSuccess();
      onClose();
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet via Viem";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-2xl p-8 w-full max-w-md shadow-2xl relative flex flex-col gap-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-high transition-colors"
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="font-display-lg text-headline-md text-on-surface">
            Connect Wallet to Access Console
          </h2>
          <p className="font-body-base text-xs text-on-surface-variant">
            Verify wallet ownership via Viem to access autonomous multi-agent execution.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-error/10 border border-error/30 rounded text-error font-mono-data text-xs">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-4 pt-2">
          <button
            onClick={handleViemConnect}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <MdAccountBalanceWallet className="text-xl" />
            {loading ? "CONNECTING VIA VIEM..." : "CONNECT METAMASK / VIEM WALLET"}
          </button>
        </div>
      </div>
    </div>
  );
}
