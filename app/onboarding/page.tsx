"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MdAccountBalanceWallet,
  MdPerson,
  MdUpload,
  MdArrowForward,
  MdCheck,
} from "react-icons/md";

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [walletAddress, setWalletAddress] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [avatarBase64, setAvatarBase64] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nameError, setNameError] = useState<boolean>(false);

  useEffect(() => {
    const raw = localStorage.getItem("agentops_user_session");
    if (!raw) {
      // No session — redirect to home
      router.replace("/");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.isAuthenticated) {
        // Already fully set up — go to dashboard
        router.replace("/dashboard");
        return;
      }
      if (!parsed.walletAddress) {
        router.replace("/");
        return;
      }
      setWalletAddress(parsed.walletAddress);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarBase64(result);
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNameError(true);
      setErrorMsg("Please enter your display name.");
      return;
    }
    setNameError(false);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          fullName: fullName.trim(),
          avatarBase64: avatarBase64 || undefined,
        }),
      });

      const data = await res.json();

      localStorage.setItem(
        "agentops_user_session",
        JSON.stringify({
          userId: data.userId || walletAddress,
          walletAddress,
          fullName: data.fullName || fullName.trim(),
          avatarUrl: data.avatarUrl || "",
          isAuthenticated: true,
        })
      );

      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) return null;

  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background grid decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-10 z-0">
        <svg className="w-full h-full text-outline-variant stroke-current" preserveAspectRatio="none" viewBox="0 0 100 100">
          <pattern id="og" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" strokeWidth="0.4" />
          </pattern>
          <rect width="100" height="100" fill="url(#og)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono-data text-[11px] text-primary uppercase tracking-widest">
              New Operator Detected
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-tight">
            Set Up Your<br />Operator Profile
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-sm">
            You&apos;re one step away from the console. Tell us how to identify you in the system.
          </p>
        </div>

        {/* Wallet badge */}
        <div className="flex items-center gap-3 mb-8 px-4 py-3 bg-surface-container rounded-lg border border-outline-variant/30">
          <MdAccountBalanceWallet className="text-primary text-lg shrink-0" />
          <div className="flex flex-col">
            <span className="font-mono-data text-[10px] text-on-surface-variant uppercase tracking-wider">
              Connected Wallet
            </span>
            <span className="font-mono-data text-sm text-on-surface">{shortAddress}</span>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-primary shrink-0" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-primary/10 border-2 border-dashed border-primary/40 overflow-hidden flex items-center justify-center hover:border-primary/70 hover:bg-primary/20 transition-all group"
            >
              {avatarPreview ? (
                <>
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <MdUpload className="text-white text-2xl" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-primary/60 group-hover:text-primary transition-colors">
                  <MdPerson className="text-4xl" />
                  <MdUpload className="text-sm" />
                </div>
              )}
            </button>
            <span className="text-on-surface-variant font-mono-data text-[10px]">
              {avatarPreview ? "Click avatar to change" : "Upload profile photo (optional)"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Display Name */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider">
              Display Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (nameError && e.target.value.trim()) setNameError(false);
              }}
              placeholder="e.g. Alice Chen"
              maxLength={64}
              autoFocus
              className={`w-full bg-surface border rounded-lg px-4 py-3.5 text-on-surface font-mono-data text-sm placeholder:text-on-surface-variant/40 focus:outline-none transition-all ${
                nameError
                  ? "border-error/60 focus:border-error focus:ring-1 focus:ring-error/30"
                  : "border-outline-variant/40 focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
              }`}
            />
            {nameError && (
              <span className="text-error font-mono-data text-[11px]">Display name is required.</span>
            )}
          </div>

          {/* API Error */}
          {errorMsg && !nameError && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error font-mono-data text-xs">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !fullName.trim()}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                SETTING UP...
              </span>
            ) : (
              <>
                <MdCheck className="text-lg" />
                ENTER THE CONSOLE
                <MdArrowForward className="text-lg" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
