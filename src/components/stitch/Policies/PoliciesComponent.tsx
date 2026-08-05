"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";
import { MdGavel, MdEdit } from "react-icons/md";

// Mirrors the Policy interface from policyEngine.ts exactly.
// Field names must stay in sync with what /api/keeperhub/policy returns.
interface PolicyData {
  maxTransactionUsd: number;
  minConfidence: number;
  requiredApprovals: number;
  allowedChainId: number;
  allowedActions: string[];
}

// Fallback mirrors DEFAULT_MVP_POLICY in policyEngine.ts exactly.
// Only "transfer" is supported in the agent panel, policy engine, and KeeperHub integration.
// Do not add action types here that don't exist in the actual system.
const DEFAULT_POLICY_FALLBACK: PolicyData = {
  maxTransactionUsd: 50,
  minConfidence: 0.85,
  requiredApprovals: 2,
  allowedChainId: 11155111,
  allowedActions: ["transfer"],
};

export function PoliciesComponent() {
  const [policy, setPolicy] = useState<PolicyData>(DEFAULT_POLICY_FALLBACK);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadPolicy() {
      try {
        const raw = localStorage.getItem("agentops_user_session");
        const userId = raw ? JSON.parse(raw).userId : undefined;
        const url = userId ? `/api/keeperhub/policy?userId=${userId}` : "/api/keeperhub/policy";
        const res = await fetch(url);
        const data = await res.json();
        if (data.policy) {
          setPolicy(data.policy);
        }
      } catch (err) {
        console.error("Failed to load policy rules from database:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicy();
  }, []);

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
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-all duration-200">
                  <MdEdit className="text-[20px]" />
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Max Transaction Amount */}
                <div className="flex flex-col space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Max Transaction Amount
                  </span>
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <span className="inline-block w-24 h-8 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                    ) : (
                      <span className="font-mono-data text-mono-data text-on-surface bg-surface-container-high px-3 py-1.5 rounded border border-outline-variant/30">
                        ${policy.maxTransactionUsd.toFixed(2)} USD
                      </span>
                    )}
                  </div>
                </div>

                {/* Min Confidence Threshold */}
                <div className="flex flex-col space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Min Confidence Threshold
                  </span>
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <span className="inline-block w-24 h-8 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                    ) : (
                      <>
                        <span className="font-mono-data text-mono-data text-on-surface bg-surface-container-high px-3 py-1.5 rounded border border-outline-variant/30">
                          {(policy.minConfidence * 100).toFixed(0)}%
                        </span>
                        <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${policy.minConfidence * 100}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Required Agent Approvals */}
                <div className="flex flex-col space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Required Agent Approvals
                  </span>
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <span className="inline-block w-24 h-8 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                {/* Allowed Chain */}
                <div className="flex flex-col space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Allowed Chain
                  </span>
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <span className="inline-block w-40 h-8 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                    ) : (
                      <span className="font-mono-data text-mono-data text-on-surface bg-surface-container-high px-3 py-1.5 rounded border border-outline-variant/30 flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 320 512">
                          <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
                        </svg>
                        Ethereum Sepolia (Chain ID: {policy.allowedChainId})
                      </span>
                    )}
                  </div>
                </div>

                {/* Allowed Action Types — Full Width */}
                <div className="flex flex-col space-y-3 md:col-span-2 pt-4 border-t border-outline-variant/30">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Allowed Action Types
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {loading ? (
                      <span className="inline-block w-20 h-7 bg-surface-container-high rounded border border-outline-variant/30 animate-pulse" />
                    ) : (
                      policy.allowedActions.map((act) => (
                        <span
                          key={act}
                          className="px-3 py-1 bg-surface-container-high border border-outline-variant/30 rounded font-mono-data text-mono-data text-primary uppercase"
                        >
                          #{act}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative light glow */}
              <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
