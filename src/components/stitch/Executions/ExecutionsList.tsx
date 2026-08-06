"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useExecutions, useInvalidateExecutions } from "@/src/hooks/useExecutions";
import { usePolicy } from "@/src/hooks/usePolicy";
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
  MdClose,
  MdAnalytics,
  MdShield,
  MdScale,
  MdGavel,
  MdHub,
  MdWarning,
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

// EVM address validation — /^0x[0-9a-fA-F]{40}$/
function isEvmAddress(v: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(v.trim());
}

// ─── AgentCard ────────────────────────────────────────────────────────────────
// Renders an individual agent verdict card. When `revealed` flips to true,
// GSAP staggers each reason line in — sliding up from y:10 and fading from
// opacity:0 — so they appear one-by-one rather than all at once.
function AgentCard({
  agent,
  Icon,
  revealed,
  result,
}: {
  agent: "analyst" | "security" | "risk";
  Icon: React.ComponentType<{ className?: string }>;
  revealed: boolean;
  result?: { decision: "approve" | "reject"; confidence: number; reasons: string[] };
}) {
  const reasonsRef = useRef<HTMLUListElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!revealed || !result || hasAnimated.current || !reasonsRef.current) return;
    hasAnimated.current = true;

    const items = reasonsRef.current.querySelectorAll("li");
    // Start hidden
    gsap.set(items, { opacity: 0, y: 10 });
    // Stagger in
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: "power2.out",
      stagger: 0.18,
      delay: 0.1, // brief pause after card fades in
    });
  }, [revealed, result]);

  const isApprove = result?.decision === "approve";

  return (
    <div
      className={`border rounded-lg p-3 flex flex-col gap-2 transition-all duration-500 ${
        revealed
          ? isApprove
            ? "bg-primary/5 border-primary/30"
            : "bg-error/5 border-error/30"
          : "bg-surface-container-highest border-outline-variant/20 opacity-40"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className={`text-base ${
            revealed && isApprove
              ? "text-primary"
              : revealed
              ? "text-error"
              : "text-on-surface-variant"
          }`}
        />
        <span className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface">
          {agent}
        </span>
      </div>

      {revealed && result ? (
        <>
          <span
            className={`font-mono-data text-[10px] font-semibold ${
              isApprove ? "text-primary" : "text-error"
            }`}
          >
            {result.decision.toUpperCase()} {(result.confidence * 100).toFixed(0)}%
          </span>
          <ul ref={reasonsRef} className="flex flex-col gap-1 list-none p-0 m-0">
            {result.reasons.map((r, i) => (
              <li
                key={i}
                className="text-[10px] text-on-surface-variant leading-relaxed"
                style={{ opacity: 0 }} // GSAP will animate this
              >
                <span className={`mr-1 ${isApprove ? "text-primary" : "text-error"}`}>›</span>
                {r}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="h-4 w-12 bg-surface-container rounded animate-pulse" />
      )}
    </div>
  );
}


type LiveStage =
  | "idle"
  | "agents"
  | "consensus"
  | "policy"
  | "rejected"
  | "simulating"
  | "broadcasting"
  | "confirming"
  | "confirmed"
  | "failed"
  | "error";

interface AgentResult {
  decision: "approve" | "reject";
  confidence: number;
  reasons: string[];
}

interface LiveState {
  stage: LiveStage;
  analyst?: AgentResult;
  security?: AgentResult;
  risk?: AgentResult;
  revealedAgents: ("analyst" | "security" | "risk")[];
  consensusApprovals?: number;
  policyPassed?: boolean;
  policyReasons?: string[];
  txHash?: string;
  txLink?: string;
  error?: string;
  storedRecord?: ExecutionRecord;
  /** True when agents reasoned with live KeeperHub MCP tool access */
  mcpGrounded?: boolean;
  /** MCP tool names actually called during agent reasoning */
  mcpToolsUsed?: string[];
}

export function ExecutionsList() {
  const router = useRouter();
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

  const { data: rawExecutions = [] } = useExecutions(walletAddress);
  const { data: fetchedPolicy } = usePolicy(walletAddress);
  const invalidateExecutions = useInvalidateExecutions();

  const [filter, setFilter] = useState<"all" | "confirmed" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [userPolicy, setUserPolicy] = useState<{ maxTransactionUsd: number } | null>(null);

  // Sync executions state when React Query updates
  useEffect(() => {
    if (rawExecutions) {
      setExecutions(mapExecutions(rawExecutions as unknown as Record<string, unknown>[]));
    }
  }, [rawExecutions]);

  // Sync policy state when React Query updates
  useEffect(() => {
    if (fetchedPolicy) {
      setUserPolicy(fetchedPolicy as { maxTransactionUsd: number });
    }
  }, [fetchedPolicy]);

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [formRecipient, setFormRecipient] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Live execution state
  const [isRunning, setIsRunning] = useState(false);
  const [liveState, setLiveState] = useState<LiveState>({ stage: "idle", revealedAgents: [] });
  const [showLive, setShowLive] = useState(false);
  const agentRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  function mapExecutions(raw: Record<string, unknown>[]): ExecutionRecord[] {
    return raw.map((e) => ({
      id: e.id as string,
      triggerDescription: e.triggerDescription as string,
      status: e.status as "confirmed" | "rejected" | "running",
      decision: e.decision as "EXECUTE" | "REJECT",
      consensusScore: `${(e.consensusResult as { approvalCount?: number })?.approvalCount ?? 3}/3 Approved`,
      policyPassed: (e.policyResult as { passed?: boolean })?.passed ?? true,
      amountEth: e.amountEth as string,
      amountUsd: e.amountUsd as string,
      timestamp: e.timestamp as string,
      txHash: (e.keeperhubResult as { transactionHash?: string } | null)?.transactionHash,
      txLink: (e.keeperhubResult as { transactionLink?: string } | null)?.transactionLink,
    }));
  }

  function openForm() {
    setFormRecipient("");
    setFormAmount("");
    setFormDescription("");
    setFormError(null);
    setShowForm(true);
  }

  function closeModal() {
    if (isRunning) return; // don't close while running
    setShowForm(false);
    setShowLive(false);
    setLiveState({ stage: "idle", revealedAgents: [] });
    if (agentRevealTimerRef.current) clearTimeout(agentRevealTimerRef.current);
  }

  function validateForm(): string | null {
    if (!isEvmAddress(formRecipient)) {
      return "Recipient must be a valid Ethereum address (0x followed by 40 hex characters).";
    }
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      return "Amount must be a positive number.";
    }
    // Pre-policy amount check
    if (userPolicy) {
      const ethPrice = 3000;
      const usdValue = amt * ethPrice;
      if (usdValue > userPolicy.maxTransactionUsd) {
        return `Amount $${usdValue.toFixed(2)} USD exceeds your policy maximum of $${userPolicy.maxTransactionUsd.toFixed(2)} USD. Edit your policy or reduce the amount.`;
      }
    }
    if (!formDescription.trim()) {
      return "Trigger description is required.";
    }
    return null;
  }

  // Sequentially reveal agent cards with 600ms delay between each
  function scheduleAgentReveal(panel: { analyst: AgentResult; security: AgentResult; risk: AgentResult }) {
    const order: ("analyst" | "security" | "risk")[] = ["analyst", "security", "risk"];
    setLiveState((prev) => ({
      ...prev,
      analyst: panel.analyst,
      security: panel.security,
      risk: panel.risk,
      revealedAgents: [],
    }));
    order.forEach((agent, i) => {
      agentRevealTimerRef.current = setTimeout(() => {
        setLiveState((prev) => ({
          ...prev,
          revealedAgents: [...prev.revealedAgents.filter((a) => a !== agent), agent],
        }));
      }, i * 650);
    });
  }

  async function submitTrigger() {
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setIsRunning(true);
    setShowLive(true);
    setLiveState({ stage: "agents", revealedAgents: [] });

    const raw = localStorage.getItem("agentops_user_session");
    const walletAddress = raw ? JSON.parse(raw).walletAddress : undefined;

    try {
      const res = await fetch("/api/keeperhub/multi-agent-execution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          triggerDescription: formDescription.trim(),
          recipientAddress: formRecipient.trim(),
          amountEth: formAmount.trim(),
        }),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        setLiveState((prev) => ({ ...prev, stage: "error", error: errData.error }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const { stage, data } = JSON.parse(line.slice(6));

            if (stage === "agents" && data) {
              const panel = data as {
                analyst: AgentResult;
                security: AgentResult;
                risk: AgentResult;
                mcpGrounded?: boolean;
                mcpToolsUsed?: string[];
              };
              scheduleAgentReveal(panel);
              setLiveState((prev) => ({
                ...prev,
                stage: "agents",
                mcpGrounded: panel.mcpGrounded ?? false,
                mcpToolsUsed: panel.mcpToolsUsed ?? [],
              }));
            } else if (stage === "consensus" && data) {
              setLiveState((prev) => ({
                ...prev,
                stage: "consensus",
                consensusApprovals: (data as { approvalCount: number }).approvalCount,
              }));
            } else if (stage === "policy" && data) {
              const p = data as { passed: boolean; reasons: string[] };
              setLiveState((prev) => ({
                ...prev,
                stage: "policy",
                policyPassed: p.passed,
                policyReasons: p.reasons,
              }));
            } else if (stage === "rejected") {
              setLiveState((prev) => ({ ...prev, stage: "rejected" }));
            } else if (stage === "simulating") {
              setLiveState((prev) => ({ ...prev, stage: "simulating" }));
            } else if (stage === "broadcasting") {
              setLiveState((prev) => ({ ...prev, stage: "broadcasting" }));
            } else if (stage === "confirming") {
              setLiveState((prev) => ({ ...prev, stage: "confirming" }));
            } else if (stage === "confirmed" && data) {
              const kh = data as { transactionHash?: string; transactionLink?: string };
              setLiveState((prev) => ({
                ...prev,
                stage: "confirmed",
                txHash: kh.transactionHash,
                txLink: kh.transactionLink,
              }));
            } else if (stage === "failed" && data) {
              setLiveState((prev) => ({
                ...prev,
                stage: "failed",
                error: (data as { error?: string }).error,
              }));
            } else if (stage === "done" && data) {
              const d = data as { storedRecord: Record<string, unknown>; result: unknown };
              const stored = d.storedRecord;
              const newRecord: ExecutionRecord = {
                id: stored.id as string,
                triggerDescription: stored.triggerDescription as string,
                status: stored.status as "confirmed" | "rejected",
                decision: stored.decision as "EXECUTE" | "REJECT",
                consensusScore: "3/3 Approved",
                policyPassed: stored.executed as boolean,
                amountEth: stored.amountEth as string,
                amountUsd: stored.amountUsd as string,
                timestamp: "Just now",
                txHash: (stored.keeperhubResult as { transactionHash?: string } | null)?.transactionHash,
                txLink: (stored.keeperhubResult as { transactionLink?: string } | null)?.transactionLink,
              };
              setLiveState((prev) => ({ ...prev, storedRecord: newRecord }));
              setExecutions((prev) => [newRecord, ...prev]);
              invalidateExecutions(walletAddress);
            } else if (stage === "error" && data) {
              setLiveState((prev) => ({
                ...prev,
                stage: "error",
                error: (data as { message?: string }).message,
              }));
            }
          } catch {
            // malformed SSE line, skip
          }
        }
      }
    } catch (err) {
      setLiveState((prev) => ({
        ...prev,
        stage: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    } finally {
      setIsRunning(false);
    }
  }

  const filteredExecutions = executions.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      item.triggerDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.txHash && item.txHash.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const isTerminal = ["rejected", "confirmed", "failed", "error"].includes(liveState.stage);

  // ─── Stage Progress Bar ──────────────────────────────────────────────────
  const STAGES: { key: LiveStage; label: string }[] = [
    { key: "agents", label: "Agent Analysis" },
    { key: "consensus", label: "Consensus" },
    { key: "policy", label: "Policy Check" },
    { key: "simulating", label: "Simulating" },
    { key: "broadcasting", label: "Broadcasting" },
    { key: "confirming", label: "Confirming" },
    { key: "confirmed", label: "Confirmed" },
  ];
  const stageOrder = STAGES.map((s) => s.key);
  const currentStageIdx = stageOrder.indexOf(liveState.stage);

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
                onClick={openForm}
                className="bg-primary hover:bg-primary/90 text-on-primary font-label-caps text-label-caps px-6 py-3 rounded shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0"
              >
                <MdPlayArrow className="text-xl" />
                SIMULATE TRIGGER
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
                {(["all", "confirmed", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded font-label-caps text-[11px] transition-colors ${
                      filter === f
                        ? f === "rejected"
                          ? "bg-error text-on-error"
                          : "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {f.toUpperCase()} ({f === "all" ? executions.length : executions.filter((e) => e.status === f).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Executions List */}
            <div className="flex flex-col gap-4">
              {filteredExecutions.length === 0 ? (
                <div className="bg-surface-container rounded-xl p-12 text-center flex flex-col items-center justify-center border border-outline-variant/30">
                  <span className="font-mono-data text-mono-data text-on-surface-variant">
                    No execution records yet. Simulate a trigger to run your first multi-agent execution.
                  </span>
                </div>
              ) : (
                filteredExecutions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/executions/${item.id}`)}
                    className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-200 group shadow-sm hover:shadow-md relative overflow-hidden cursor-pointer"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.status === "confirmed" ? "bg-primary" : "bg-error"}`} />
                    <div className="flex flex-col gap-2 flex-1 pl-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          href={`/executions/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono-data text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors"
                        >
                          {item.id}
                        </Link>
                        <span className={`px-2.5 py-0.5 rounded font-mono-data text-[10px] tracking-wider uppercase font-semibold flex items-center gap-1 ${item.status === "confirmed" ? "bg-primary/10 text-primary border border-primary/30" : "bg-error/10 text-error border border-error/30"}`}>
                          {item.status === "confirmed" ? <MdCheckCircle className="text-[14px]" /> : <MdError className="text-[14px]" />}
                          {item.decision}
                        </span>
                        <span className="font-mono-data text-[11px] text-on-surface-variant bg-surface-container-highest px-2.5 py-0.5 rounded border border-outline-variant/20">
                          Consensus: {item.consensusScore}
                        </span>
                        <span className="font-mono-data text-[11px] text-on-surface-variant ml-auto md:ml-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="font-body-base text-body-base text-on-surface line-clamp-1">{item.triggerDescription}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/20">
                      <div className="flex flex-col items-end">
                        <span className="font-mono-data text-mono-data font-semibold text-on-surface">{item.amountEth}</span>
                        <span className="font-mono-data text-[11px] text-on-surface-variant">{item.amountUsd}</span>
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
                          <span className="hidden lg:inline">{item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}</span>
                          <MdOpenInNew className="text-sm" />
                        </a>
                      ) : (
                        <span className="px-3 py-1 bg-surface-container-highest rounded font-mono-data text-[11px] text-on-surface-variant/50 border border-outline-variant/20">NO ONCHAIN TX</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Modal Overlay ───────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6">
          <div className="bg-surface-container w-full max-w-5xl rounded-2xl border border-outline-variant/40 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Simulate Trigger</h2>
                <p className="text-[12px] text-on-surface-variant font-mono-data mt-0.5">
                  Stands in for what would be an automated trigger in production
                </p>
              </div>
              {!isRunning && (
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
                  <MdClose />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* ── Input Form (shown until pipeline starts) ── */}
              {!showLive && (
                <div className="px-6 py-5 flex flex-col gap-5">
                  {/* Recipient Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">
                      Recipient Address *
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={formRecipient}
                      onChange={(e) => { setFormRecipient(e.target.value); setFormError(null); }}
                      className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2.5 font-mono-data text-mono-data text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                    />
                    {formRecipient && !isEvmAddress(formRecipient) && (
                      <span className="text-error text-[11px] font-mono-data">Must be a valid EVM address (0x + 40 hex chars)</span>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">
                      Amount (ETH) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={0.0001}
                        placeholder="0.0001"
                        value={formAmount}
                        onChange={(e) => { setFormAmount(e.target.value); setFormError(null); }}
                        className="flex-1 bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2.5 font-mono-data text-mono-data text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
                      />
                      <span className="font-mono-data text-mono-data text-on-surface-variant px-2">ETH</span>
                    </div>
                    {formAmount && parseFloat(formAmount) > 0 && (
                      <span className="text-on-surface-variant text-[11px] font-mono-data">
                        ≈ ${(parseFloat(formAmount) * 3000).toFixed(2)} USD
                        {userPolicy && ` / $${userPolicy.maxTransactionUsd.toFixed(2)} limit`}
                      </span>
                    )}
                  </div>

                  {/* Trigger Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">
                      Trigger Description *
                    </label>
                    <textarea
                      placeholder="e.g. Scheduled treasury payment: monthly vendor invoice Q3"
                      value={formDescription}
                      onChange={(e) => { setFormDescription(e.target.value); setFormError(null); }}
                      rows={3}
                      className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-3 py-2.5 font-body-base text-body-base text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40 resize-none"
                    />
                    <span className="text-on-surface-variant/60 text-[11px] font-mono-data">
                      This is the string the agent panel reasons over — describe it as a real trigger scenario.
                    </span>
                  </div>

                  {formError && (
                    <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 flex items-start gap-2 text-error text-[12px] font-mono-data">
                      <MdWarning className="text-base shrink-0 mt-0.5" />
                      {formError}
                    </div>
                  )}
                </div>
              )}

              {/* ── Live Execution Stage Viewer ── */}
              {showLive && (
                <div className="px-6 py-5 flex flex-col gap-5">
                  {/* Progress bar */}
                  {liveState.stage !== "rejected" && liveState.stage !== "failed" && liveState.stage !== "error" && (
                    <div className="flex items-center gap-1">
                      {STAGES.map((s, i) => (
                        <div
                          key={s.key}
                          className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                            i <= currentStageIdx ? "bg-primary" : "bg-surface-container-highest"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Agent Cards */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                       <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">
                         Agent Panel
                       </span>
                       {liveState.mcpGrounded && (
                         <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-primary font-mono-data text-[9px] uppercase tracking-wider">
                           <MdHub className="text-[10px]" />
                           KeeperHub MCP
                           {liveState.mcpToolsUsed && liveState.mcpToolsUsed.length > 0 && (
                             <span className="opacity-70 ml-0.5">· {liveState.mcpToolsUsed.join(", ")}</span>
                           )}
                         </span>
                       )}
                     </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(["analyst", "security", "risk"] as const).map((agent) => {
                        const icons = { analyst: MdAnalytics, security: MdShield, risk: MdScale };
                        return (
                          <AgentCard
                            key={agent}
                            agent={agent}
                            Icon={icons[agent]}
                            revealed={liveState.revealedAgents.includes(agent)}
                            result={liveState[agent]}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Consensus & Policy */}
                  {(liveState.stage === "consensus" || liveState.consensusApprovals !== undefined) && (
                    <div className="flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">Consensus</span>
                      <div className="bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-2.5 flex items-center gap-2 font-mono-data text-mono-data">
                        <MdGavel className="text-primary" />
                        {liveState.consensusApprovals ?? "—"}/3 agents approved
                      </div>
                    </div>
                  )}
                  {(liveState.policyPassed !== undefined) && (
                    <div className="flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">Policy Check</span>
                      <div className={`border rounded-lg px-4 py-2.5 flex items-center gap-2 font-mono-data text-mono-data text-[12px] ${liveState.policyPassed ? "bg-primary/5 border-primary/30 text-primary" : "bg-error/5 border-error/30 text-error"}`}>
                        {liveState.policyPassed ? <MdCheckCircle /> : <MdError />}
                        {liveState.policyPassed ? "Policy passed" : `Policy failed: ${liveState.policyReasons?.[0] ?? ""}`}
                      </div>
                    </div>
                  )}

                  {/* KeeperHub Stages */}
                  {["simulating", "broadcasting", "confirming", "confirmed", "failed"].includes(liveState.stage) && (
                    <div className="flex flex-col gap-2">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-[11px]">KeeperHub Executor</span>
                      <div className="flex flex-col gap-1.5">
                        {(["simulating", "broadcasting", "confirming"] as const).map((s) => {
                          const si = ["simulating", "broadcasting", "confirming", "confirmed", "failed"].indexOf(liveState.stage);
                          const ti = ["simulating", "broadcasting", "confirming", "confirmed", "failed"].indexOf(s);
                          const active = liveState.stage === s;
                          const done = si > ti;
                          return (
                            <div key={s} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-mono-data transition-all duration-300 ${active ? "bg-primary/10 border-primary/30 text-primary" : done ? "bg-surface-container-high border-outline-variant/20 text-on-surface-variant" : "opacity-30 bg-surface-container-highest border-outline-variant/10 text-on-surface-variant"}`}>
                              {done ? <MdCheckCircle className="text-primary text-sm" /> : active ? <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" /> : <span className="w-3 h-3 rounded-full border border-outline-variant/40 inline-block" />}
                              {s.charAt(0).toUpperCase() + s.slice(1)}...
                            </div>
                          );
                        })}
                        {(liveState.stage === "confirmed" || liveState.stage === "failed") && (
                          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-mono-data ${liveState.stage === "confirmed" ? "bg-primary/10 border-primary/40 text-primary" : "bg-error/10 border-error/30 text-error"}`}>
                            {liveState.stage === "confirmed" ? <MdHub className="text-sm" /> : <MdError className="text-sm" />}
                            {liveState.stage === "confirmed" ? (
                              <span>
                                Confirmed
                                {liveState.txHash && (
                                  <a href={liveState.txLink} target="_blank" rel="noreferrer" className="ml-2 underline opacity-80 hover:opacity-100 transition-opacity">
                                    {liveState.txHash.slice(0, 10)}...{liveState.txHash.slice(-6)} ↗
                                  </a>
                                )}
                              </span>
                            ) : (
                              `Failed: ${liveState.error ?? "Unknown error"}`
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejection banner */}
                  {liveState.stage === "rejected" && (
                    <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 flex items-start gap-2 text-error text-[12px] font-mono-data">
                      <MdError className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Rejected — pipeline stopped before KeeperHub</p>
                        {liveState.policyReasons?.map((r, i) => <p key={i} className="opacity-80">{r}</p>)}
                      </div>
                    </div>
                  )}

                  {/* Error banner */}
                  {liveState.stage === "error" && (
                    <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-[12px] font-mono-data">
                      {liveState.error ?? "Unknown error occurred"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-end gap-3">
              {!showLive ? (
                <>
                  <button onClick={closeModal} className="px-4 py-2 rounded border border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-caps text-label-caps transition-all duration-200">
                    Cancel
                  </button>
                  <button
                    onClick={submitTrigger}
                    className="px-6 py-2 rounded bg-primary hover:bg-primary/90 text-on-primary font-label-caps text-label-caps flex items-center gap-2 shadow-md transition-all duration-200"
                  >
                    <MdPlayArrow className="text-base" />
                    Run Execution
                  </button>
                </>
              ) : isTerminal ? (
                <button onClick={closeModal} className="px-6 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-label-caps text-label-caps transition-all duration-200">
                  Done
                </button>
              ) : (
                <span className="font-mono-data text-[12px] text-on-surface-variant animate-pulse">Running pipeline...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
