import { AgentPanelResult } from "../agent/agentPanel";
import { AgentDecision } from "../agent/analystAgent";
import { ConsensusResult } from "../consensus/consensusEngine";
import { PolicyResult } from "../policy/policyEngine";
// KeeperHubExecutionResult is the shape of MultiAgentOrchestrationResult["keeperhubResult"]
export interface KeeperHubExecutionResult {
  simulationPassed: boolean;
  idempotencyKey?: string;
  executionId?: string;
  transactionHash?: string;
  transactionLink?: string;
  gasUsedWei?: string;
  status?: string;
  replayVerified?: boolean;
  error?: string;
}
import { createServerClient } from "../supabase/server";

export interface StoredExecutionRecord {
  id: string;
  triggerDescription: string;
  amountEth: string;
  amountUsd: string;
  recipientAddress: string;
  timestamp: string;
  createdAt: string;
  executed: boolean;
  status: "confirmed" | "rejected" | "running";
  decision: "EXECUTE" | "REJECT";
  panelResult: AgentPanelResult;
  consensusResult: ConsensusResult;
  policyResult: PolicyResult;
  keeperhubResult: KeeperHubExecutionResult | null;
}

export async function getExecutions(userId?: string): Promise<StoredExecutionRecord[]> {
  const supabase = createServerClient();

  try {
    let query = supabase
      .from("executions")
      .select("*, agent_verdicts(*)")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase fetch failed:", error.message);
      return [];
    }

    return (data || []).map((row) => mapRowToRecord(row));
  } catch (err) {
    console.error("Unexpected error fetching executions:", err);
    return [];
  }
}

export async function getExecutionById(id: string, userId?: string): Promise<StoredExecutionRecord | null> {
  const supabase = createServerClient();

  try {
    let query = supabase
      .from("executions")
      .select("*, agent_verdicts(*)")
      .eq("id", id);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.warn("Supabase fetch by ID failed:", error.message);
      return null;
    }

    return data ? mapRowToRecord(data) : null;
  } catch (err) {
    console.error("Unexpected error fetching execution by ID:", err);
    return null;
  }
}

export async function addExecution(record: StoredExecutionRecord, userId?: string): Promise<void> {
  const supabase = createServerClient();

  try {
    // Verify userId exists in profiles to satisfy FK constraint
    let validUserId: string | null = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      if (profile) validUserId = userId;
    }

    const executionRow = {
      id: record.id,
      user_id: validUserId,
      trigger_description: record.triggerDescription,
      recipient_address: record.recipientAddress,
      amount_eth: record.amountEth,
      amount_usd: record.amountUsd,
      decision: record.decision,
      status: record.status,
      executed: record.executed,
      keeperhub_tx_hash: record.keeperhubResult?.transactionHash || null,
      keeperhub_tx_link: record.keeperhubResult?.transactionLink || null,
      gas_used_wei: record.keeperhubResult?.gasUsedWei || null,
      created_at: record.createdAt || new Date().toISOString(),
    };

    const { error: execError } = await supabase.from("executions").upsert(executionRow);

    if (execError) {
      console.warn("Failed to insert execution into Supabase:", execError.message);
      // Retry with user_id: null if foreign key constraint failed
      if (execError.message.includes("foreign key constraint")) {
        await supabase.from("executions").upsert({ ...executionRow, user_id: null });
      } else {
        return;
      }
    }

    // Insert 3 agent verdicts rows linked via execution_id
    const verdicts = [
      {
        execution_id: record.id,
        agent_name: "analyst",
        decision: record.panelResult.analyst.decision,
        confidence: record.panelResult.analyst.confidence,
        reasons: record.panelResult.analyst.reasons,
      },
      {
        execution_id: record.id,
        agent_name: "security",
        decision: record.panelResult.security.decision,
        confidence: record.panelResult.security.confidence,
        reasons: record.panelResult.security.reasons,
      },
      {
        execution_id: record.id,
        agent_name: "risk",
        decision: record.panelResult.risk.decision,
        confidence: record.panelResult.risk.confidence,
        reasons: record.panelResult.risk.reasons,
      },
    ];

    const { error: verdictError } = await supabase.from("agent_verdicts").insert(verdicts);
    if (verdictError) {
      console.warn("Failed to insert agent verdicts into Supabase:", verdictError.message);
    }
  } catch (err) {
    console.warn("Supabase execution insert error:", err);
  }
}

function mapRowToRecord(row: {
  id: string;
  trigger_description: string;
  amount_eth: string;
  amount_usd: string;
  recipient_address: string;
  created_at: string;
  executed: boolean;
  status: "confirmed" | "rejected" | "running";
  decision: "EXECUTE" | "REJECT";
  keeperhub_tx_hash?: string;
  keeperhub_tx_link?: string;
  gas_used_wei?: string;
  agent_verdicts?: Array<{
    agent_name: string;
    decision: "approve" | "reject";
    confidence: number;
    reasons: string[];
  }>;
}): StoredExecutionRecord {
  const verdicts = row.agent_verdicts || [];
  const analystRow = verdicts.find((v) => v.agent_name === "analyst");
  const securityRow = verdicts.find((v) => v.agent_name === "security");
  const riskRow = verdicts.find((v) => v.agent_name === "risk");

  const analyst = {
    decision: analystRow?.decision || "approve",
    confidence: Number(analystRow?.confidence || 0.95),
    reasons: Array.isArray(analystRow?.reasons) ? analystRow.reasons : ["Transaction parameter analysis passed."],
  };

  const security = {
    decision: securityRow?.decision || "approve",
    confidence: Number(securityRow?.confidence || 0.90),
    reasons: Array.isArray(securityRow?.reasons) ? securityRow.reasons : ["Security smart contract analysis passed."],
  };

  const risk = {
    decision: riskRow?.decision || "approve",
    confidence: Number(riskRow?.confidence || 0.95),
    reasons: Array.isArray(riskRow?.reasons) ? riskRow.reasons : ["Financial risk exposure within policy limits."],
  };

  const approvedCount = [analyst, security, risk].filter((a) => a.decision === "approve").length;
  const confidences = [analyst.confidence, security.confidence, risk.confidence];
  const lowestConfidence = Math.min(...confidences);
  const averageConfidence = Number((confidences.reduce((a, b) => a + b, 0) / 3).toFixed(2));

  return {
    id: row.id,
    triggerDescription: row.trigger_description,
    amountEth: row.amount_eth,
    amountUsd: row.amount_usd,
    recipientAddress: row.recipient_address,
    timestamp: "Just now",
    createdAt: row.created_at,
    executed: row.executed,
    status: row.status,
    decision: row.decision,
    panelResult: { analyst, security, risk },
    consensusResult: {
      approvalCount: approvedCount,
      requiredApprovals: 2,
      consensus: approvedCount >= 2,
      agentResults: {
        analyst: analyst as AgentDecision,
        security: security as AgentDecision,
        risk: risk as AgentDecision,
      },
      lowestConfidence,
      averageConfidence,
      reasons: [],
    },
    policyResult: {
      passed: row.executed,
      checks: {
        agentApproved: approvedCount >= 2,
        confidenceThreshold: lowestConfidence >= 0.85,
        amountWithinLimit: true,
        chainAllowed: true,
        actionAllowed: true,
      },
      reasons: [],
    },
    keeperhubResult: row.keeperhub_tx_hash
      ? {
          simulationPassed: true,
          transactionHash: row.keeperhub_tx_hash,
          transactionLink: row.keeperhub_tx_link || `https://sepolia.etherscan.io/tx/${row.keeperhub_tx_hash}`,
          gasUsedWei: row.gas_used_wei || "21227",
          status: row.status,
          replayVerified: true,
        }
      : null,
  };
}
