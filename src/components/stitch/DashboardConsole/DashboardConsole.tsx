"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";
import { MdFilterList, MdCheckCircle, MdError, MdTag } from "react-icons/md";
import { useExecutions } from "@/src/hooks/useExecutions";
import { usePolicy } from "@/src/hooks/usePolicy";
import { useAgentStats } from "@/src/hooks/useAgents";

interface ExecutionRecord {
  id: string;
  triggerDescription: string;
  status: "confirmed" | "rejected" | "running";
  decision: "EXECUTE" | "REJECT";
  amountEth: string;
  amountUsd: string;
  timestamp: string;
  txHash?: string;
  txLink?: string;
}

export function DashboardConsole() {
  const [walletAddress] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("agentops_user_session");
      if (raw) {
        try {
          return JSON.parse(raw).walletAddress || undefined;
        } catch {
          // ignore
        }
      }
    }
    return undefined;
  });

  const { data: rawExecutions = [] } = useExecutions(walletAddress);
  const { data: policy } = usePolicy(walletAddress);
  const { data: agentsMap } = useAgentStats(walletAddress);

  const executions: ExecutionRecord[] = rawExecutions.map((e) => ({
    id: e.id,
    triggerDescription: e.triggerDescription,
    status: e.status,
    decision: e.decision,
    amountEth: e.amountEth,
    amountUsd: e.amountUsd,
    timestamp: e.timestamp,
    txHash: e.keeperhubResult?.transactionHash,
    txLink: e.keeperhubResult?.transactionLink,
  }));

  const totalCount = executions.length;
  const confirmedCount = executions.filter((r) => r.status === "confirmed").length;
  const successRate = totalCount > 0 ? `${((confirmedCount / totalCount) * 100).toFixed(1)}%` : "100.0%";
  const activePolicies = policy ? 1 : 0;
  const activeAgents = agentsMap ? Object.keys(agentsMap).length : 3;


  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-24 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full gap-8">
            {/* Metric Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  System Status
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary relative">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                    Live
                  </span>
                </div>
              </div>

              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-secondary-container/20 rounded-full blur-xl group-hover:bg-secondary-container/40 transition-colors"></div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Active Policies
                </span>
                <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                  {activePolicies === null ? (
                    <span className="inline-block w-6 h-6 bg-surface-container-high rounded animate-pulse" />
                  ) : (
                    activePolicies
                  )}
                </span>
              </div>

              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Total Executions
                </span>
                <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                  {totalCount}
                </span>
              </div>

              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Success Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg-mobile text-display-lg-mobile text-primary">
                    {successRate}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Active Agents
                </span>
                <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                  {activeAgents === null ? (
                    <span className="inline-block w-6 h-6 bg-surface-container-high rounded animate-pulse" />
                  ) : (
                    activeAgents
                  )}
                </span>
              </div>
            </section>

            {/* Recent Executions Section */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Recent Executions
                  </h2>
                  <div className="px-2 py-1 rounded bg-surface-container-high font-mono-data text-mono-data text-on-surface-variant text-[10px] border border-outline-variant/30">
                    REAL-TIME LIVE LOG
                  </div>
                </div>
                <Link
                  href="/executions"
                  className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors rounded text-primary font-label-caps text-label-caps border border-outline-variant/30"
                >
                  <MdFilterList className="text-[18px]" />
                  VIEW ALL EXECUTIONS
                </Link>
              </div>

              {executions.length === 0 ? (
                <div className="bg-surface-container rounded-xl p-12 text-center flex flex-col items-center justify-center border border-outline-variant/30 gap-3">
                  <span className="font-mono-data text-mono-data text-on-surface">
                    No execution records in database yet.
                  </span>
                  <Link
                    href="/executions"
                    className="text-primary font-label-caps text-xs hover:underline"
                  >
                    Go to Executions page to trigger your first live multi-agent execution &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {executions.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/executions/${item.id}`}
                      className="bg-surface-container flex flex-col rounded-lg p-5 gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden border border-outline-variant/30"
                    >
                      <div
                        className={`absolute top-0 left-0 w-1 h-full ${
                          item.status === "confirmed" ? "bg-primary" : "bg-error"
                        }`}
                      ></div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {item.status === "confirmed" ? (
                            <MdCheckCircle className="text-primary text-[20px]" />
                          ) : (
                            <MdError className="text-error text-[20px]" />
                          )}
                          <span className="font-mono-data text-mono-data text-on-surface font-bold">
                            {item.id}
                          </span>
                        </div>
                        <span className="font-mono-data text-mono-data text-on-surface-variant text-[11px]">
                          {item.timestamp}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                          STATUS: {item.decision}
                        </span>
                        <p className="font-body-base text-body-base text-on-surface line-clamp-2">
                          {item.triggerDescription}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-auto pt-4 items-center justify-between">
                        <span className="px-2 py-1 bg-surface rounded text-[10px] font-mono-data text-mono-data text-on-surface-variant border border-outline-variant/30">
                          {item.amountEth} ({item.amountUsd})
                        </span>
                        {item.txHash && (
                          <span className="px-2 py-1 bg-surface rounded text-[10px] font-mono-data text-mono-data text-primary border border-primary/30 flex items-center gap-1">
                            <MdTag className="text-[12px]" /> TX CONFIRMED
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
