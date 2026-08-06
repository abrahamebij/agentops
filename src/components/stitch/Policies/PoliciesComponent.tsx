"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";
import { MdGavel, MdEdit, MdSave, MdClose, MdCheckCircle } from "react-icons/md";

// Mirrors the Policy interface from policyEngine.ts exactly.
interface PolicyData {
  maxTransactionUsd: number;
  minConfidence: number;
  requiredApprovals: number;
  allowedChainId: number;
  allowedActions: string[];
}

// Fallback mirrors DEFAULT_MVP_POLICY in policyEngine.ts exactly.
const DEFAULT_POLICY_FALLBACK: PolicyData = {
  maxTransactionUsd: 50,
  minConfidence: 0.85,
  requiredApprovals: 2,
  allowedChainId: 11155111,
  allowedActions: ["transfer"],
};

export function PoliciesComponent() {
  const [policy, setPolicy] = useState<PolicyData>(DEFAULT_POLICY_FALLBACK);
  const [draft, setDraft] = useState<PolicyData>(DEFAULT_POLICY_FALLBACK);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolicy() {
      try {
        const raw = localStorage.getItem("agentops_user_session");
        const walletAddress = raw ? JSON.parse(raw).walletAddress : undefined;
        const url = walletAddress ? `/api/keeperhub/policy?walletAddress=${walletAddress}` : "/api/keeperhub/policy";
        const res = await fetch(url);
        const data = await res.json();
        if (data.policy) {
          setPolicy(data.policy);
          setDraft(data.policy);
        }
      } catch (err) {
        console.error("Failed to load policy rules from database:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicy();
  }, []);

  function startEdit() {
    setDraft({ ...policy });
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft({ ...policy });
    setSaveError(null);
    setEditing(false);
  }

  async function savePolicy() {
    setSaving(true);
    setSaveError(null);
    try {
      const raw = localStorage.getItem("agentops_user_session");
      const walletAddress = raw ? JSON.parse(raw).walletAddress : undefined;

      const res = await fetch("/api/keeperhub/policy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          maxTransactionUsd: draft.maxTransactionUsd,
          minConfidence: draft.minConfidence,
          requiredApprovals: draft.requiredApprovals,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save policy");
        return;
      }

      setPolicy(data.policy);
      setDraft(data.policy);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-24 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full max-w-container-max mx-auto space-y-12 px-4">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 max-w-2xl pt-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-surface-container-high rounded font-mono-data text-mono-data text-on-surface-variant border border-outline-variant/30 tracking-widest text-[11px]">
                  ENFORCED IN CODE &amp; SUPABASE DATABASE
                </span>
                {saveSuccess && (
                  <span className="px-2.5 py-1 bg-primary/10 border border-primary/30 rounded font-mono-data text-mono-data text-primary text-[11px] flex items-center gap-1.5 animate-pulse">
                    <MdCheckCircle className="text-sm" />
                    SAVED
                  </span>
                )}
              </div>
              <h1 className="font-display-lg text-display-lg text-on-background">
                System Policies
              </h1>
              <p className="font-body-base text-body-base text-on-surface-variant">
                Deterministic code-level constraints enforced after agent consensus.
              </p>
            </div>

            {/* Main Policy Card */}
            <div className="bg-surface-container rounded-xl border border-outline-variant/30 p-8 flex flex-col space-y-8 relative overflow-hidden group hover:border-outline-variant/60 transition-colors duration-300 shadow-md">
              {/* Card Header */}
              <div className="flex justify-between items-center pb-6 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <MdGavel className="text-primary text-2xl" />
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Global Constraints
                  </h2>
                </div>
                {!editing ? (
                  <button
                    onClick={startEdit}
                    disabled={loading}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-primary/10 border border-outline-variant/30 hover:border-primary/40 text-on-surface-variant hover:text-primary transition-all duration-200 disabled:opacity-40"
                    title="Edit policy"
                  >
                    <MdEdit className="text-[20px]" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-caps text-label-caps transition-all duration-200 disabled:opacity-40"
                    >
                      <MdClose className="text-base" />
                      Cancel
                    </button>
                    <button
                      onClick={savePolicy}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary hover:bg-primary/90 text-on-primary font-label-caps text-label-caps transition-all duration-200 shadow-md disabled:opacity-60"
                    >
                      <MdSave className="text-base" />
                      {saving ? "Saving..." : "Save Policy"}
                    </button>
                  </div>
                )}
              </div>

              {saveError && (
                <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error font-mono-data text-[12px]">
                  {saveError}
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                {/* Max Transaction Amount */}
                <div className="flex flex-col space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Max Transaction Amount
                  </span>
                  {loading ? (
                    <span className="inline-block w-24 h-9 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                  ) : editing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface-variant font-mono-data text-mono-data">$</span>
                      <input
                        type="number"
                        min={0.01}
                        step={1}
                        value={draft.maxTransactionUsd}
                        onChange={(e) => setDraft({ ...draft, maxTransactionUsd: parseFloat(e.target.value) || 0 })}
                        className="w-28 bg-surface-container-high border border-primary/40 rounded px-3 py-1.5 font-mono-data text-mono-data text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                      <span className="text-on-surface-variant font-mono-data text-mono-data">USD</span>
                    </div>
                  ) : (
                    <span className="font-mono-data text-mono-data text-on-surface bg-surface-container-high px-3 py-1.5 rounded border border-outline-variant/30 w-fit">
                      ${policy.maxTransactionUsd.toFixed(2)} USD
                    </span>
                  )}
                </div>

                {/* Min Confidence Threshold */}
                <div className="flex flex-col space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Min Confidence Threshold
                  </span>
                  {loading ? (
                    <span className="inline-block w-24 h-9 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                  ) : editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={Math.round(draft.minConfidence * 100)}
                        onChange={(e) => setDraft({ ...draft, minConfidence: (parseInt(e.target.value) || 0) / 100 })}
                        className="w-20 bg-surface-container-high border border-primary/40 rounded px-3 py-1.5 font-mono-data text-mono-data text-on-surface focus:outline-none focus:border-primary transition-colors"
                      />
                      <span className="text-on-surface-variant font-mono-data text-mono-data">%</span>
                      <div className="w-24 h-2 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${draft.minConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-mono-data text-on-surface bg-surface-container-high px-3 py-1.5 rounded border border-outline-variant/30">
                        {(policy.minConfidence * 100).toFixed(0)}%
                      </span>
                      <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${policy.minConfidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Required Agent Approvals */}
                <div className="flex flex-col space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Required Agent Approvals
                  </span>
                  {loading ? (
                    <span className="inline-block w-24 h-9 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                  ) : editing ? (
                    <div className="flex items-center gap-3">
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          onClick={() => setDraft({ ...draft, requiredApprovals: n })}
                          className={`w-10 h-10 rounded-full font-mono-data text-mono-data font-semibold transition-all duration-200 border ${
                            draft.requiredApprovals === n
                              ? "bg-primary text-on-primary border-primary shadow-md scale-110"
                              : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:border-primary/40"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <span className="text-on-surface-variant font-mono-data text-[12px]">of 3 agents</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-mono-data text-on-surface bg-surface-container-high px-3 py-1.5 rounded border border-outline-variant/30">
                        {policy.requiredApprovals} / 3
                      </span>
                      <div className="flex gap-1.5 ml-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full ${
                              i < policy.requiredApprovals
                                ? "bg-primary"
                                : "bg-surface-container-highest border border-outline-variant/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Allowed Chain — always read-only */}
                <div className="flex flex-col space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Allowed Chain
                  </span>
                  {loading ? (
                    <span className="inline-block w-40 h-9 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                  ) : (
                    <span className="font-mono-data text-mono-data text-on-surface bg-surface-container-high px-3 py-1.5 rounded border border-outline-variant/30 flex items-center gap-2 w-fit opacity-70">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 320 512">
                        <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
                      </svg>
                      Ethereum Sepolia (Chain ID: {policy.allowedChainId})
                      {editing && <span className="text-[10px] text-on-surface-variant/60 ml-1">(fixed)</span>}
                    </span>
                  )}
                </div>

                {/* Allowed Action Types — transfer only, always read-only */}
                <div className="flex flex-col space-y-3 md:col-span-2 pt-4 border-t border-outline-variant/30">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Allowed Action Types
                  </span>
                  {loading ? (
                    <span className="inline-block w-20 h-7 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                  ) : (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded font-mono-data text-mono-data text-primary uppercase">
                        #transfer
                      </span>
                      {editing && (
                        <span className="text-[11px] text-on-surface-variant/60 font-mono-data">
                          — only supported action in this version
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative light glow */}
              <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
