"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";
import { MdAccountTree } from "react-icons/md";
import { useAgentStats } from "@/src/hooks/useAgents";

interface AgentStats {
  approvalRate: string;
  totalExecutions: number;
  latencyMs: number;
  version: string;
}

export function AgentsComponent() {
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const raw = localStorage.getItem("agentops_user_session");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setWalletAddress(parsed.walletAddress || undefined);
      } catch {
        // Ignore invalid session JSON
      }
    }
  }, []);

  const { data: fetchedStats } = useAgentStats(walletAddress);

  const stats = fetchedStats || {
    analyst: { approvalRate: "100.0%", totalExecutions: 0, latencyMs: 89, version: "v4.2.1-epsilon" },
    security: { approvalRate: "100.0%", totalExecutions: 0, latencyMs: 142, version: "v2.9.0-delta" },
    risk: { approvalRate: "100.0%", totalExecutions: 0, latencyMs: 64, version: "v3.1.5-gamma" },
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-24 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full max-w-container-max mx-auto px-4">
            {/* Page Header */}
            <div className="flex flex-col gap-2 mb-12 relative z-10 pt-4">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                System Agents
              </h1>
              <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
                Autonomous models monitoring and verifying every onchain execution from Supabase DB.
              </p>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-12">
              {/* Agent 1: Analyst Model */}
              <div className="flex flex-col bg-surface-container-low rounded-xl shadow-lg relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-outline-variant/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Analyst Model
                      </h2>
                      <span className="font-mono-data text-mono-data text-outline">
                        {stats.analyst.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded shadow-sm border border-outline-variant/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-caps text-label-caps text-on-surface">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-8 flex-grow">
                    Validates trigger data against expected parameters and historical benchmarks.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        APPROVAL RATE
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-data text-mono-data text-primary">
                          {stats.analyst.approvalRate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        LATENCY
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        {stats.analyst.latencyMs}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        EXECUTIONS
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        {stats.analyst.totalExecutions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent 2: Security Model */}
              <div className="flex flex-col bg-surface-container-low rounded-xl shadow-lg relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-outline-variant/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Security Model
                      </h2>
                      <span className="font-mono-data text-mono-data text-outline">
                        {stats.security.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded shadow-sm border border-outline-variant/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-caps text-label-caps text-on-surface">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-8 flex-grow">
                    Screens recipient addresses and target contracts for known vulnerabilities or exploits.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        APPROVAL RATE
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-data text-mono-data text-primary">
                          {stats.security.approvalRate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        LATENCY
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        {stats.security.latencyMs}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        EXECUTIONS
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        {stats.security.totalExecutions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent 3: Risk Model */}
              <div className="flex flex-col bg-surface-container-low rounded-xl shadow-lg relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-outline-variant/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Risk Model
                      </h2>
                      <span className="font-mono-data text-mono-data text-outline">
                        {stats.risk.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded shadow-sm border border-outline-variant/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-caps text-label-caps text-on-surface">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-8 flex-grow">
                    Enforces spending limits, frequency thresholds, and slippage tolerance.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        APPROVAL RATE
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-data text-mono-data text-primary">
                          {stats.risk.approvalRate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        LATENCY
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        {stats.risk.latencyMs}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        EXECUTIONS
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        {stats.risk.totalExecutions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consensus Rule Bar */}
            <div className="w-full bg-surface-container-high rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden border border-outline-variant/30">
              <div className="absolute top-0 left-0 h-1 w-full bg-surface-container-lowest">
                <div className="h-full bg-primary w-2/3 shadow-[0_0_10px_rgba(174,198,255,0.5)]"></div>
              </div>
              <div className="flex items-center gap-4 z-10">
                <div className="w-10 h-10 rounded bg-surface flex items-center justify-center shadow-sm border border-outline-variant/30">
                  <MdAccountTree className="text-primary text-xl" />
                </div>
                <span className="font-mono-data text-mono-data text-on-surface">
                  Consensus Rule: 2 of 3 agents must approve to execute.
                </span>
              </div>
              <div className="flex items-center gap-3 z-10 bg-surface-container-lowest px-4 py-2 rounded-lg shadow-sm border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-caps text-label-caps text-primary tracking-widest">
                  THRESHOLD: 85%
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
