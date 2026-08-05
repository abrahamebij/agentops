"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { MdAccountBalanceWallet, MdCloudUpload, MdCheck, MdClose } from "react-icons/md";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function OnboardingModal({ isOpen, onClose, onSuccess }: OnboardingModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"connect" | "profile">("connect");
  const [walletAddress, setWalletAddress] = useState<string>("0x97271d60c7e41de4f2d37752008e3c18e9108b12");
  const [fullName, setFullName] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const connectBrowserWallet = async () => {
    setErrorMsg(null);
    if (typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum) {
      try {
        const eth = (window as unknown as { ethereum: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
        }
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    }
    setStep("profile");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const completeOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let publicAvatarUrl = "";

      // 1. Upload avatar to Supabase Storage bucket 'avatars' if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${walletAddress}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
          console.warn("Avatar upload error:", uploadError.message);
        } else {
          const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          publicAvatarUrl = publicData.publicUrl;
        }
      }

      // 2. Sign in or authenticate session with Supabase
      const dummyEmail = `${walletAddress.toLowerCase()}@agentops.io`;
      const dummyPassword = `Pass_${walletAddress.slice(0, 10)}`;

      let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: dummyPassword,
      });

      if (authError) {
        // Create user if not exists
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
          options: {
            data: {
              wallet_address: walletAddress,
              full_name: fullName || "Operator",
            },
          },
        });
        if (signUpError) {
          throw new Error(signUpError.message);
        }
        authData = signUpData;
      }

      const userId = authData?.user?.id;

      // 3. Save profile to Supabase 'profiles' table
      if (userId) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: userId,
          wallet_address: walletAddress,
          full_name: fullName || "Operator",
          avatar_url: publicAvatarUrl || avatarPreview || "",
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn("Profile store notice:", profileError.message);
        }
      }

      // 4. Store session state locally
      localStorage.setItem(
        "agentops_user_session",
        JSON.stringify({
          walletAddress,
          fullName: fullName || "Operator",
          avatarUrl: publicAvatarUrl || avatarPreview || "",
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
          <div className="flex items-center gap-2 text-primary font-mono-data text-xs uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            AgentOps Web3 Authentication
          </div>
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
              onClick={connectBrowserWallet}
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MdAccountBalanceWallet className="text-xl" />
              CONNECT METAMASK / BROWSER WALLET
            </button>
          </div>
        ) : (
          <form onSubmit={completeOnboarding} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-mono-data text-xs text-on-surface-variant font-semibold">
                CONNECTED WALLET ADDRESS
              </label>
              <div className="bg-surface-container-high px-3 py-2 rounded font-mono-data text-xs text-primary truncate border border-outline-variant/30">
                {walletAddress}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono-data text-xs text-on-surface font-semibold">
                OPERATOR NAME / HANDLE *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex (Treasury Manager)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg px-4 py-3 font-mono-data text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono-data text-xs text-on-surface font-semibold">
                PROFILE AVATAR (SUPABASE BUCKET)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center overflow-hidden shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-mono-data text-xs text-on-surface-variant">IMG</span>
                  )}
                </div>
                <label className="cursor-pointer bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface px-4 py-2.5 rounded-lg font-mono-data text-xs flex items-center gap-2 transition-colors">
                  <MdCloudUpload className="text-base text-primary" />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <MdCheck className="text-xl" />
              {loading ? "SAVING TO SUPABASE..." : "COMPLETE ONBOARDING & LAUNCH CONSOLE"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
