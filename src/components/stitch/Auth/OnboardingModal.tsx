"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdAccountBalanceWallet, MdClose } from "react-icons/md";
import { connectViemWallet } from "@/src/lib/web3/viemClient";
import { useQueryClient } from "@tanstack/react-query";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OnboardingModal({ isOpen, onClose, onSuccess }: OnboardingModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWalletConnect = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      // 1. Connect wallet via Viem
      const res = await connectViemWallet();
      const address = res.address;

      // 2. Check if wallet already exists in DB
      const profileRes = await fetch(`/api/auth/profile?walletAddress=${address}`);
      const profileData = await profileRes.json();

      if (profileData.exists && profileData.profile) {
        // ── Existing user: build full session → go straight to dashboard ──
        localStorage.setItem(
          "agentops_user_session",
          JSON.stringify({
            userId: profileData.profile.userId,
            walletAddress: profileData.profile.walletAddress || address,
            fullName: profileData.profile.fullName || "",
            avatarUrl: profileData.profile.avatarUrl || "",
            isAuthenticated: true,
          })
        );
        queryClient.invalidateQueries({ queryKey: ["profile", address] });
        if (onSuccess) onSuccess();
        onClose();
        router.push("/dashboard");
      } else {
        // ── New user: store pending session (not yet authenticated) → /onboarding ──
        localStorage.setItem(
          "agentops_user_session",
          JSON.stringify({
            walletAddress: address,
            isAuthenticated: false,
          })
        );
        onClose();
        router.push("/onboarding");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-surface-container border border-outline-variant/40 rounded-2xl p-8 w-full max-w-md shadow-2xl relative flex flex-col gap-6">
        <button
          onClick={handleClose}
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
            onClick={handleWalletConnect}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <MdAccountBalanceWallet className="text-xl" />
            {loading ? "CHECKING WALLET..." : "CONNECT METAMASK / VIEM WALLET"}
          </button>
        </div>
      </div>
    </div>
  );
}
