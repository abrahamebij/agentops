"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";
import { useProfile, useUpdateProfile } from "@/src/hooks/useProfile";
import {
  MdPerson,
  MdAccountBalanceWallet,
  MdUpload,
  MdSave,
  MdLogout,
  MdCheckCircle,
  MdContentCopy,
  MdCheck,
  MdShield,
  MdKey,
} from "react-icons/md";

export function ProfileComponent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const [fullName, setFullName] = useState<string>("");
  const [avatarBase64, setAvatarBase64] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("agentops_user_session");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.walletAddress) {
          setWalletAddress(parsed.walletAddress);
          setFullName(parsed.fullName || "");
          setAvatarPreview(parsed.avatarUrl || "");
        }
      } catch {
        // Ignore invalid session JSON
      }
    }
  }, []);

  const { data: profile, isLoading } = useProfile(walletAddress);
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      if (profile.avatarUrl) {
        setAvatarPreview(profile.avatarUrl);
      }
    }
  }, [profile]);

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

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !fullName.trim()) return;

    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await updateProfileMutation.mutateAsync({
        walletAddress,
        fullName: fullName.trim(),
        avatarBase64: avatarBase64 || undefined,
      });

      const raw = localStorage.getItem("agentops_user_session");
      if (raw) {
        try {
          const existing = JSON.parse(raw);
          localStorage.setItem(
            "agentops_user_session",
            JSON.stringify({
              ...existing,
              userId: res.userId,
              fullName: res.fullName,
              avatarUrl: res.avatarUrl || avatarPreview,
              isAuthenticated: true,
            })
          );
        } catch {
          // ignore
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setSaveError(msg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("agentops_user_session");
    router.push("/");
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
    : "No Wallet Connected";

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-24 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full max-w-container-max mx-auto px-4 gap-8">
            {/* Header */}
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono-data text-[11px] text-primary uppercase tracking-widest">
                  Operator Settings
                </span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                Profile & Account Settings
              </h1>
              <p className="font-body-base text-xs text-on-surface-variant max-w-xl">
                Manage your operator identity, display preferences, connected web3 wallet credentials, and session access.
              </p>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Profile Form */}
              <div className="lg:col-span-2 bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                  <div className="flex items-center gap-3">
                    <MdPerson className="text-primary text-xl" />
                    <h2 className="text-base font-semibold text-on-surface">
                      Operator Information
                    </h2>
                  </div>
                  {saveSuccess && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/40 rounded-full text-primary font-mono-data text-xs">
                      <MdCheckCircle className="text-sm" />
                      Profile Saved Successfully
                    </div>
                  )}
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-surface-container-high/40 rounded-xl border border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-2 border-dashed border-primary/40 hover:border-primary transition-all group bg-primary/10 shrink-0"
                    >
                      {avatarPreview ? (
                        <>
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                            <MdUpload className="text-xl" />
                            <span className="font-mono-data text-[10px] uppercase tracking-wider">Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-primary/60 group-hover:text-primary transition-colors">
                          <MdPerson className="text-3xl" />
                          <span className="font-mono-data text-[9px] uppercase">Upload</span>
                        </div>
                      )}
                    </button>

                    <div className="flex flex-col gap-1 text-center sm:text-left">
                      <span className="text-sm font-semibold text-on-surface">
                        Profile Photo / Avatar
                      </span>
                      <p className="font-body-base text-xs text-on-surface-variant max-w-xs">
                        Upload custom avatar image (PNG, JPG, or SVG). High quality SVGs supported.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-primary font-mono-data text-xs hover:underline pt-1"
                      >
                        <MdUpload className="text-sm" />
                        Browse Image File...
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.svg,image/svg+xml"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  {/* Display Name Input */}
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-label-caps text-on-surface-variant text-[11px] uppercase tracking-wider flex items-center justify-between">
                      <span>Display Name</span>
                      <span className="text-on-surface-variant/40 font-mono-data">Max 64 chars</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alice Chen"
                      maxLength={64}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface font-mono-data text-sm focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/40"
                    />
                  </div>

                  {saveError && (
                    <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-error font-mono-data text-xs">
                      {saveError}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending || !fullName.trim()}
                      className="bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateProfileMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                          SAVING...
                        </span>
                      ) : (
                        <>
                          <MdSave className="text-base" />
                          SAVE CHANGES
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar Identity & Wallet Status Card */}
              <div className="flex flex-col gap-6">
                {/* Wallet Details */}
                <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                  <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                    <MdAccountBalanceWallet className="text-primary text-xl" />
                    <h3 className="text-base font-semibold text-on-surface">
                      Connected Identity
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5 p-3.5 bg-surface-container-high/40 rounded-xl border border-outline-variant/20">
                      <span className="font-mono-data text-[10px] text-on-surface-variant uppercase tracking-wider">
                        Wallet Address
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono-data text-xs text-on-surface font-semibold">
                          {shortAddress}
                        </span>
                        {walletAddress && (
                          <button
                            onClick={handleCopyAddress}
                            className="p-1 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
                            title="Copy Wallet Address"
                          >
                            {copied ? <MdCheck className="text-primary text-sm" /> : <MdContentCopy className="text-sm" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-surface-container-high/40 rounded-xl border border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <MdShield className="text-primary text-base" />
                        <span className="font-mono-data text-xs text-on-surface-variant">Role</span>
                      </div>
                      <span className="font-mono-data text-xs px-2.5 py-0.5 bg-primary/10 border border-primary/40 rounded-md text-primary font-semibold">
                        {profile?.role || "Operator"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-surface-container-high/40 rounded-xl border border-outline-variant/20">
                      <div className="flex items-center gap-2 shrink-0">
                        <MdKey className="text-primary text-base" />
                        <span className="font-mono-data text-xs text-on-surface-variant">Network</span>
                      </div>
                      <span className="font-mono-data text-xs text-on-surface text-right shrink-0">
                        Sepolia (11155111)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Log Out Danger Zone */}
                <div className="bg-surface-container border border-error/20 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-semibold text-on-surface">
                      Session Management
                    </h4>
                    <p className="font-body-base text-xs text-on-surface-variant">
                      Sign out of your active operator session on this device.
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-error/10 hover:bg-error/20 border border-error/30 text-error font-label-caps text-label-caps py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <MdLogout className="text-base" />
                    LOG OUT OF CONSOLE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
