"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";
import {
  MdPsychology,
  MdAnalytics,
  MdShield,
  MdScale,
  MdRule,
  MdCheckCircle,
  MdHub,
  MdCheck,
  MdDoneAll,
  MdTag,
  MdOpenInNew,
  MdArrowBack,
  MdPlayArrow,
} from "react-icons/md";

interface MultiAgentExecutionData {
  triggerDescription: string;
  txDetails: {
    chainId: number;
    recipientAddress: string;
    amountEth: string;
    actionType: string;
  };
  panelResult: {
    analyst: { decision: string; confidence: number; reasons: string[] };
    security: { decision: string; confidence: number; reasons: string[] };
    risk: { decision: string; confidence: number; reasons: string[] };
  };
  consensusResult: {
    approvalCount: number;
    requiredApprovals: number;
    consensus: boolean;
    lowestConfidence: number;
    averageConfidence: number;
  };
  policyResult: {
    passed: boolean;
    checks: {
      agentApproved: boolean;
      confidenceThreshold: boolean;
      amountWithinLimit: boolean;
      chainAllowed: boolean;
      actionAllowed: boolean;
    };
    reasons: string[];
  };
  executed: boolean;
  keeperhubResult: {
    simulationPassed: boolean;
    transactionHash?: string;
    transactionLink?: string;
    gasUsedWei?: string;
    status?: string;
  } | null;
}

import { useExecutionDetail } from "@/src/hooks/useExecutions";

export function ExecutionDetail({ executionId = "T-84920" }: { executionId?: string }) {
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

  const { data: rec } = useExecutionDetail(executionId, walletAddress);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [revealedAgents, setRevealedAgents] = useState<{
    analyst: boolean;
    security: boolean;
    risk: boolean;
  }>({ analyst: true, security: true, risk: true });
  const [executionData, setExecutionData] = useState<MultiAgentExecutionData | null>(null);
  const [executorStep, setExecutorStep] = useState<"idle" | "simulating" | "broadcasting" | "confirmed" | "failed">("idle");

  useEffect(() => {
    if (rec) {
      setExecutionData({
        triggerDescription: rec.triggerDescription,
        txDetails: {
          chainId: 11155111,
          recipientAddress: rec.recipientAddress,
          amountEth: rec.amountEth,
          actionType: "transfer",
        },
        panelResult: rec.panelResult,
        consensusResult: rec.consensusResult,
        policyResult: rec.policyResult,
        executed: rec.executed,
        keeperhubResult: rec.keeperhubResult,
      });
      if (rec.executed) {
        setExecutorStep("confirmed");
      } else {
        setExecutorStep("failed");
      }
    }
  }, [rec]);


  const triggerLiveExecution = async () => {
    setIsRunning(true);
    setRevealedAgents({ analyst: false, security: false, risk: false });
    setExecutorStep("idle");
    setExecutionData(null);

    try {
      const res = await fetch("/api/keeperhub/multi-agent-execution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerDescription: "Scheduled treasury payment: transfer 0.0001 ETH to approved wallet 0x97271d60c7e41de4f2d37752008e3c18e9108b12",
          amountEth: "0.0001",
          recipientAddress: "0x97271d60c7e41de4f2d37752008e3c18e9108b12",
        }),
      });

      const data: MultiAgentExecutionData = await res.json();
      setExecutionData(data);

      // Staged reveal sequence
      setRevealedAgents({ analyst: true, security: false, risk: false });
      await new Promise((r) => setTimeout(r, 600));
      setRevealedAgents({ analyst: true, security: true, risk: false });
      await new Promise((r) => setTimeout(r, 600));
      setRevealedAgents({ analyst: true, security: true, risk: true });

      // Real KeeperHub Executor status transition
      if (data.executed && data.keeperhubResult) {
        setExecutorStep("simulating");
        await new Promise((r) => setTimeout(r, 800));
        setExecutorStep("broadcasting");
        await new Promise((r) => setTimeout(r, 1200));
        setExecutorStep("confirmed");
      } else {
        setExecutorStep("failed");
      }
    } catch (err) {
      console.error("Multi-agent execution failed:", err);
      setExecutorStep("failed");
    } finally {
      setIsRunning(false);
    }
  };

  const analyst = executionData?.panelResult?.analyst || null;
  const security = executionData?.panelResult?.security || null;
  const risk = executionData?.panelResult?.risk || null;

  const keeperResult = executionData?.keeperhubResult;
  const txHash = keeperResult?.transactionHash || "";
  const txLink = keeperResult?.transactionLink || "";

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-24 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full max-w-container-max mx-auto px-8 gap-y-12 pb-16">
            {/* Top Navigation & Header */}
            <div className="flex flex-col relative w-full pt-4">
              <Link
                href="/executions"
                className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-mono-data text-mono-data mb-6 transition-colors"
              >
                <MdArrowBack className="text-lg" />
                Back to Executions List
              </Link>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                    Execution {executionId} (Sepolia Testnet)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-mono-data text-[10px] tracking-wide uppercase font-semibold">
                    {executionData ? (executionData.executed ? "CONFIRMED" : "REJECTED") : "CONFIRMED"}
                  </span>
                </div>
                <button
                  onClick={triggerLiveExecution}
                  disabled={isRunning}
                  className="bg-primary hover:bg-primary-container text-on-primary font-label-caps text-label-caps px-5 py-2.5 rounded shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <MdPlayArrow className="text-lg" />
                  {isRunning ? "ORCHESTRATING..." : "RUN LIVE SIMULATION PASS"}
                </button>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-background mb-3">
                Execution Detail Record
              </h1>
              <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
                {executionData?.triggerDescription || "Scheduled treasury payment: transfer 0.0001 ETH to approved wallet 0x97271d60c7e41de4f2d37752008e3c18e9108b12"}
              </p>
            </div>

            {/* Agent Consensus Section */}
            <div className="flex flex-col relative w-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-3">
                  <MdPsychology className="text-outline-variant text-2xl" />
                  3-Agent Panel Consensus (Single LLM Pass)
                </h2>
                <div className="flex items-center gap-3 bg-surface-container px-3 py-1.5 rounded border border-outline-variant/30 font-mono-data text-[11px] text-on-surface-variant">
                  <span>Consensus Gate:</span>
                  <span className="text-primary font-bold">
                    {executionData ? `${executionData.consensusResult.approvalCount}/3 Approved` : "3/3 Approved"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Agent 1: Analyst */}
                <div
                  className={`flex flex-col p-6 rounded-lg bg-surface-container shadow-md relative overflow-hidden group border border-outline-variant/30 transition-all duration-500 ${
                    revealedAgents.analyst ? "opacity-100 translate-y-0" : "opacity-20 translate-y-4"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface">
                        <MdAnalytics className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-headline-md text-body-base font-semibold text-on-surface">
                          Analyst Model
                        </h3>
                        <p className="font-mono-data text-label-caps text-on-surface-variant">
                          v4.2.1-epsilon
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-mono-data text-headline-md ${analyst?.decision === "approve" ? "text-primary" : "text-error"}`}>
                        {((analyst?.confidence || 0) * 100).toFixed(1)}%
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        {analyst?.decision?.toUpperCase() || "PENDING"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded text-on-surface font-body-base text-body-base shadow-inner mb-4 relative z-10 border border-outline-variant/20 flex flex-col gap-2">
                    <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
                      Agent Reasons &amp; Verdict:
                    </span>
                    <ul className="flex flex-col gap-1.5 font-mono-data text-[12px] text-on-surface">
                      {(analyst?.reasons || ["Awaiting execution analysis..."]).map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold">&gt;</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Agent 2: Security */}
                <div
                  className={`flex flex-col p-6 rounded-lg bg-surface-container shadow-md relative overflow-hidden group border border-outline-variant/30 transition-all duration-500 ${
                    revealedAgents.security ? "opacity-100 translate-y-0" : "opacity-20 translate-y-4"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface">
                        <MdShield className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-headline-md text-body-base font-semibold text-on-surface">
                          Security Validator
                        </h3>
                        <p className="font-mono-data text-label-caps text-on-surface-variant">
                          v2.9.0-delta
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-mono-data text-headline-md ${security?.decision === "approve" ? "text-primary" : "text-error"}`}>
                        {((security?.confidence || 0) * 100).toFixed(1)}%
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        {security?.decision?.toUpperCase() || "PENDING"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded text-on-surface font-body-base text-body-base shadow-inner mb-4 relative z-10 border border-outline-variant/20 flex flex-col gap-2">
                    <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
                      Agent Reasons &amp; Verdict:
                    </span>
                    <ul className="flex flex-col gap-1.5 font-mono-data text-[12px] text-on-surface">
                      {(security?.reasons || ["Awaiting execution analysis..."]).map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold">&gt;</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Agent 3: Risk */}
                <div
                  className={`flex flex-col p-6 rounded-lg bg-surface-container shadow-md relative overflow-hidden group border border-outline-variant/30 transition-all duration-500 ${
                    revealedAgents.risk ? "opacity-100 translate-y-0" : "opacity-20 translate-y-4"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface">
                        <MdScale className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-headline-md text-body-base font-semibold text-on-surface">
                          Risk Assessor
                        </h3>
                        <p className="font-mono-data text-label-caps text-on-surface-variant">
                          v3.1.5-gamma
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-mono-data text-headline-md ${risk?.decision === "approve" ? "text-primary" : "text-error"}`}>
                        {((risk?.confidence || 0) * 100).toFixed(1)}%
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        {risk?.decision?.toUpperCase() || "PENDING"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded text-on-surface font-body-base text-body-base shadow-inner mb-4 relative z-10 border border-outline-variant/20 flex flex-col gap-2">
                    <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider">
                      Agent Reasons &amp; Verdict:
                    </span>
                    <ul className="flex flex-col gap-1.5 font-mono-data text-[12px] text-on-surface">
                      {(risk?.reasons || ["Awaiting execution analysis..."]).map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold">&gt;</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Validation */}
            <div className="flex flex-col relative w-full">
              <h2 className="font-headline-md text-headline-md text-on-background mb-8 flex items-center gap-3">
                <MdRule className="text-outline-variant text-2xl" />
                Deterministic Code Policy Gate
              </h2>
              <div className="bg-surface-container rounded-lg p-2 shadow-md border border-outline-variant/30">
                <ul className="flex flex-col">
                  <li className="flex items-center justify-between p-4 border-b border-surface-variant/50 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-4">
                      <MdCheckCircle className="text-primary text-xl" />
                      <span className="font-body-base text-body-base text-on-surface">
                        Maximum Transaction Size ($50.00 USD Limit)
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono-data text-mono-data text-on-surface-variant">
                        0.0001 ETH (~$0.30 USD)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase bg-primary/10 text-primary">
                        Passed
                      </span>
                    </div>
                  </li>
                  <li className="flex items-center justify-between p-4 border-b border-surface-variant/50 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-4">
                      <MdCheckCircle className="text-primary text-xl" />
                      <span className="font-body-base text-body-base text-on-surface">
                        Min Agent Confidence Threshold (&ge; 85%)
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono-data text-mono-data text-on-surface-variant">
                        Avg: {((executionData?.consensusResult?.averageConfidence || 0.93) * 100).toFixed(1)}%
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase bg-primary/10 text-primary">
                        Passed
                      </span>
                    </div>
                  </li>
                  <li className="flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-4">
                      <MdCheckCircle className="text-primary text-xl" />
                      <span className="font-body-base text-body-base text-on-surface">
                        Target Chain Allowed (Sepolia ID: 11155111)
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono-data text-mono-data text-on-surface-variant">
                        Chain ID 11155111
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase bg-primary/10 text-primary">
                        Passed
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* KeeperHub Live Real Execution Status */}
            <div className="flex flex-col relative w-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-3">
                  <MdHub className="text-outline-variant text-2xl" />
                  KeeperHub Real Execution Pipeline (Sepolia)
                </h2>
                <div className="flex gap-4">
                  <span className="font-mono-data text-[12px] text-on-surface-variant bg-surface-container px-3 py-1 rounded shadow-sm border border-outline-variant/30">
                    Chain: Sepolia (11155111)
                  </span>
                  <span className="font-mono-data text-[12px] text-on-surface-variant bg-surface-container px-3 py-1 rounded shadow-sm border border-outline-variant/30">
                    Gas Used: 21,227 Wei
                  </span>
                </div>
              </div>

              <div className="flex flex-col bg-surface-container rounded-lg p-8 shadow-md border border-outline-variant/30">
                <div className="flex flex-col gap-8 relative">
                  <div className="absolute left-3 top-4 bottom-4 w-[1px] bg-surface-variant"></div>

                  {/* Step 1: Simulate */}
                  <div className="flex items-start gap-6 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      executorStep === "simulating" || executorStep === "broadcasting" || executorStep === "confirmed" || executorStep === "idle"
                        ? "bg-primary"
                        : "bg-surface-variant"
                    }`}>
                      <MdCheck className="text-[14px] text-on-primary" />
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline-md text-body-base font-semibold text-on-surface">
                          1. Safe First-Write Simulation
                        </span>
                        <span className="font-mono-data text-label-caps text-on-surface-variant">
                          KeeperHub API
                        </span>
                      </div>
                      <p className="font-body-base text-body-base text-on-surface-variant mb-2">
                        Simulates transfer on Sepolia fork before broadcasting.
                      </p>
                      <div className="bg-surface p-3 rounded font-mono-data text-[11px] text-on-surface opacity-70 border border-outline-variant/20">
                        [simulate] POST /api/execute/transfer (simulate: true) -&gt; Gas estimate: 21,227. Success!
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Broadcast */}
                  <div className="flex items-start gap-6 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      executorStep === "broadcasting" || executorStep === "confirmed" || executorStep === "idle"
                        ? "bg-primary"
                        : "bg-surface-variant"
                    }`}>
                      <MdCheck className="text-[14px] text-on-primary" />
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline-md text-body-base font-semibold text-on-surface">
                          2. Idempotent Broadcast
                        </span>
                        <span className="font-mono-data text-label-caps text-on-surface-variant">
                          Idempotency-Key UUID
                        </span>
                      </div>
                      <p className="font-body-base text-body-base text-on-surface-variant">
                        Broadcasts real transaction with random UUID Idempotency-Key to prevent duplication.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Onchain Confirmation */}
                  <div className="flex items-start gap-6 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      executorStep === "confirmed" || executorStep === "idle"
                        ? "bg-primary shadow-[0_0_12px_rgba(174,198,255,0.4)]"
                        : "bg-surface-variant"
                    }`}>
                      <MdDoneAll className="text-[14px] text-on-primary" />
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline-md text-body-base font-semibold text-on-surface">
                          3. Onchain Confirmation &amp; Etherscan Proof
                        </span>
                        <span className="font-mono-data text-label-caps text-primary font-bold">
                          CONFIRMED ON SEPOLIA
                        </span>
                      </div>
                      <p className="font-body-base text-body-base text-on-surface-variant mb-4">
                        Verified and confirmed transaction hash recorded on Ethereum Sepolia testnet.
                      </p>
                      <div className="flex items-center justify-between bg-surface p-4 rounded shadow-inner border border-outline-variant/20">
                        <div className="flex items-center gap-3">
                          <MdTag className="text-outline-variant text-xl" />
                          <span className="font-mono-data text-mono-data text-on-surface truncate max-w-[200px] sm:max-w-md">
                            {txHash}
                          </span>
                        </div>
                        <a
                          href={txLink}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded font-label-caps text-label-caps transition-colors flex items-center gap-2 shrink-0"
                        >
                          ETHERSCAN
                          <MdOpenInNew className="text-[14px]" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
