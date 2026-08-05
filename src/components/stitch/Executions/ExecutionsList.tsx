"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";
import {
  MdFilterList,
  MdCheckCircle,
  MdError,
  MdSearch,
  MdPlayArrow,
  MdOpenInNew,
  MdTag,
} from "react-icons/md";

export interface ExecutionRecord {
  id: string;
  triggerDescription: string;
  status: "confirmed" | "rejected" | "running";
  decision: "EXECUTE" | "REJECT";
  consensusScore: string;
  policyPassed: boolean;
  amountEth: string;
  amountUsd: string;
  timestamp: string;
  txHash?: string;
  txLink?: string;
}

export function ExecutionsList() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "confirmed" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);

  useEffect(() => {
    async function loadExecutions() {
      try {
        const raw = localStorage.getItem("agentops_user_session");
        const userId = raw ? JSON.parse(raw).userId : undefined;
        const url = userId ? `/api/keeperhub/multi-agent-execution?userId=${userId}` : "/api/keeperhub/multi-agent-execution";
        const res = await fetch(url);
        const data = await res.json();
        if (data.executions && Array.isArray(data.executions)) {
          const mapped: ExecutionRecord[] = data.executions.map((e: {
            id: string;
            triggerDescription: string;
            status: "confirmed" | "rejected" | "running";
            decision: "EXECUTE" | "REJECT";
            consensusResult?: { approvalCount: number };
            policyResult?: { passed: boolean };
            amountEth: string;
            amountUsd: string;
            timestamp: string;
            keeperhubResult?: { transactionHash?: string; transactionLink?: string };
          }) => ({
            id: e.id,
            triggerDescription: e.triggerDescription,
            status: e.status,
            decision: e.decision,
            consensusScore: `${e.consensusResult?.approvalCount || 3}/3 Approved`,
            policyPassed: e.policyResult?.passed ?? true,
            amountEth: e.amountEth,
            amountUsd: e.amountUsd,
            timestamp: e.timestamp,
            txHash: e.keeperhubResult?.transactionHash,
            txLink: e.keeperhubResult?.transactionLink,
          }));
          setExecutions(mapped);
        }
      } catch (err) {
        console.error("Failed to load stored executions:", err);
      }
    }
    loadExecutions();
  }, []);

  const filteredExecutions = executions.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      item.triggerDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.txHash && item.txHash.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const triggerNewExecution = async () => {
    setIsRunning(true);
    try {
      const raw = localStorage.getItem("agentops_user_session");
      const userId = raw ? JSON.parse(raw).userId : undefined;

      const res = await fetch("/api/keeperhub/multi-agent-execution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          triggerDescription: "Scheduled treasury payment: transfer 0.0001 ETH to approved wallet 0x97271d60c7e41de4f2d37752008e3c18e9108b12",
          amountEth: "0.0001",
          recipientAddress: "0x97271d60c7e41de4f2d37752008e3c18e9108b12",
        }),
      });

      const data = await res.json();

      const stored = data.storedRecord;
      const newRecord: ExecutionRecord = {
        id: stored?.id || `T-${Math.floor(84921 + Math.random() * 100)}`,
        triggerDescription: data.triggerDescription || "Live Multi-Agent Treasury Transfer",
        status: data.executed ? "confirmed" : "rejected",
        decision: data.executed ? "EXECUTE" : "REJECT",
        consensusScore: `${data.consensusResult?.approvalCount || 3}/3 Approved`,
        policyPassed: data.policyResult?.passed || false,
        amountEth: "0.0001 ETH",
        amountUsd: "$0.30 USD",
        timestamp: "Just now",
        txHash: data.keeperhubResult?.transactionHash,
        txLink: data.keeperhubResult?.transactionLink,
      };

      setExecutions([newRecord, ...executions]);
    } catch (err) {
      console.error("Live execution trigger failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-24 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full max-w-container-max mx-auto px-4 gap-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                    Execution Trail
                  </h1>
                  <span className="px-2.5 py-1 rounded bg-primary-container text-on-primary-container font-mono-data text-[11px] tracking-wide uppercase font-semibold">
                    {executions.length} Total
                  </span>
                </div>
                <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
                  Complete historical log of multi-agent decisions, consensus verdicts, policy checks, and KeeperHub onchain transactions.
                </p>
              </div>
              <button
                onClick={triggerNewExecution}
                disabled={isRunning}
                className="bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps px-6 py-3 rounded shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50"
              >
                <MdPlayArrow className="text-xl" />
                {isRunning ? "EXECUTING..." : "NEW MULTI-AGENT EXECUTION"}
              </button>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container rounded-xl p-4 border border-outline-variant/30 shadow-sm">
              <div className="relative w-full sm:w-96">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl" />
                <input
                  type="text"
                  placeholder="Search executions by ID, trigger, or Tx hash..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded pl-10 pr-4 py-2 font-mono-data text-mono-data text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <MdFilterList className="text-on-surface-variant text-xl mr-1" />
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded font-label-caps text-[11px] transition-colors ${
                    filter === "all"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  ALL ({executions.length})
                </button>
                <button
                  onClick={() => setFilter("confirmed")}
                  className={`px-3 py-1.5 rounded font-label-caps text-[11px] transition-colors ${
                    filter === "confirmed"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  CONFIRMED ({executions.filter((e) => e.status === "confirmed").length})
                </button>
                <button
                  onClick={() => setFilter("rejected")}
                  className={`px-3 py-1.5 rounded font-label-caps text-[11px] transition-colors ${
                    filter === "rejected"
                      ? "bg-error text-on-error"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  REJECTED ({executions.filter((e) => e.status === "rejected").length})
                </button>
              </div>
            </div>

            {/* Executions List Table / Grid */}
            <div className="flex flex-col gap-4">
              {filteredExecutions.length === 0 ? (
                <div className="bg-surface-container rounded-xl p-12 text-center flex flex-col items-center justify-center border border-outline-variant/30">
                  <span className="font-mono-data text-mono-data text-on-surface-variant">
                    No execution records match your query.
                  </span>
                </div>
              ) : (
                filteredExecutions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/executions/${item.id}`)}
                    className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-200 group shadow-sm hover:shadow-md relative overflow-hidden cursor-pointer"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        item.status === "confirmed" ? "bg-primary" : "bg-error"
                      }`}
                    ></div>

                    <div className="flex flex-col gap-2 flex-1 pl-2">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/executions/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono-data text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors"
                        >
                          {item.id}
                        </Link>
                        <span
                          className={`px-2.5 py-0.5 rounded font-mono-data text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1 ${
                            item.status === "confirmed"
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "bg-error/10 text-error border border-error/30"
                          }`}
                        >
                          {item.status === "confirmed" ? (
                            <MdCheckCircle className="text-[14px]" />
                          ) : (
                            <MdError className="text-[14px]" />
                          )}
                          {item.decision}
                        </span>
                        <span className="font-mono-data text-[11px] text-on-surface-variant bg-surface-container-highest px-2.5 py-0.5 rounded border border-outline-variant/20">
                          Consensus: {item.consensusScore}
                        </span>
                        <span className="font-mono-data text-[11px] text-on-surface-variant ml-auto md:ml-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="font-body-base text-body-base text-on-surface line-clamp-1">
                        {item.triggerDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/20">
                      <div className="flex flex-col items-end">
                        <span className="font-mono-data text-mono-data font-semibold text-on-surface">
                          {item.amountEth}
                        </span>
                        <span className="font-mono-data text-[11px] text-on-surface-variant">
                          {item.amountUsd}
                        </span>
                      </div>

                      {item.txHash ? (
                        <a
                          href={item.txLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-surface-container-highest hover:bg-surface border border-outline-variant/30 text-on-surface p-2.5 rounded transition-colors flex items-center gap-1.5 text-xs font-mono-data"
                        >
                          <MdTag className="text-primary text-base" />
                          <span className="hidden lg:inline">
                            {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                          </span>
                          <MdOpenInNew className="text-sm" />
                        </a>
                      ) : (
                        <span className="px-3 py-1 bg-surface-container-highest rounded font-mono-data text-[11px] text-on-surface-variant/50 border border-outline-variant/20">
                          NO ONCHAIN TX
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

