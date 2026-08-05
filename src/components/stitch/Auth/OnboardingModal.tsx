"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { MdAccountBalanceWallet, MdCheck, MdClose, MdCameraAlt } from "react-icons/md";
import { connectViemWallet } from "@/src/lib/web3/viemClient";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OnboardingModal({ isOpen, onClose, onSuccess }: OnboardingModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"connect" | "profile">("connect");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleViemConnect = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await connectViemWallet();
      setWalletAddress(res.address);
      setWalletBalance(res.balanceEth);
      setStep("profile");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet via Viem";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const completeOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Profile picture is strictly compulsory
    if (!avatarFile && !avatarPreview) {
      setErrorMsg("Profile avatar photo is compulsory. Please click the circular avatar to upload an image.");
      return;
    }

    setLoading(true);

    try {
      let publicAvatarUrl = avatarPreview || "";

      // 1. Upload avatar to Supabase Storage bucket 'avatars' if file provided
      if (avatarFile) {
        try {
          const fileExt = avatarFile.name.split(".").pop();
          const fileName = `${walletAddress.slice(0, 8)}-${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, avatarFile, { upsert: true });

          if (!uploadError) {
            const { data: publicData } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);
            if (publicData?.publicUrl) {
              publicAvatarUrl = publicData.publicUrl;
            }
          }
        } catch (err) {
          console.warn("Avatar upload notice:", err);
        }
      }

      // 2. Save profile via server-side API route (bypasses browser RLS auth issues)
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          fullName: fullName || "Operator",
          avatarUrl: publicAvatarUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok && data.error) {
        console.warn("Server profile route notice:", data.error);
      }

      const activeUserId = data.userId || walletAddress;

      // 3. Store session state locally
      localStorage.setItem(
        "agentops_user_session",
        JSON.stringify({
          userId: activeUserId,
          walletAddress,
          fullName: fullName || "Operator",
          avatarUrl: publicAvatarUrl,
          isAuthenticated: true,
        })
      );

      if (onSuccess) onSuccess();
      onClose();
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onboarding failed";
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
            {step === "connect" ? "Connect Wallet to Access Console" : "Complete Operator Profile"}
          </h2>
          <p className="font-body-base text-xs text-on-surface-variant">
            {step === "connect"
              ? "Verify wallet ownership to access autonomous multi-agent execution."
              : "Set up your operator name and avatar for execution audit logs."}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-error/10 border border-error/30 rounded text-error font-mono-data text-xs">
            {errorMsg}
          </div>
        )}

        {step === "connect" ? (
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
        ) : (
          <form onSubmit={completeOnboarding} className="flex flex-col gap-5">
            {/* Clickable Circular Avatar Upload */}
            <div className="flex flex-col items-center justify-center gap-2 pt-1">
              <label className="relative group cursor-pointer w-24 h-24 rounded-full border-2 border-dashed border-outline-variant hover:border-primary transition-all flex items-center justify-center overflow-hidden bg-surface-container-high shadow-inner">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <MdCameraAlt className="text-3xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white gap-1">
                  <MdCameraAlt className="text-2xl" />
                  <span className="font-mono-data text-[9px] uppercase">Change</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <span className="font-mono-data text-[11px] text-on-surface-variant text-center">
                Click circular avatar to upload photo <span className="text-error">*</span>
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono-data text-xs text-on-surface-variant font-semibold">
                CONNECTED SEPOLIA WALLET &amp; BALANCE
              </label>
              <div className="bg-surface-container-high px-3.5 py-2.5 rounded-lg font-mono-data text-xs text-primary flex items-center justify-between border border-outline-variant/30">
                <span className="truncate max-w-[200px]">{walletAddress}</span>
                <span className="font-bold text-on-surface shrink-0 ml-2">{parseFloat(walletBalance || "0").toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono-data text-xs text-on-surface font-semibold">
                OPERATOR NAME *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg px-4 py-3 font-mono-data text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <MdCheck className="text-xl" />
              {loading ? "SAVING PROFILE..." : "COMPLETE ONBOARDING & LAUNCH CONSOLE"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
