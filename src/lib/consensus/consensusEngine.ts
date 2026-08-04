import { AgentPanelResult } from "../agent/agentPanel";
import { AgentDecision } from "../agent/analystAgent";

export interface ConsensusResult {
  approvalCount: number;       // out of 3
  requiredApprovals: number;   // 2 for MVP
  consensus: boolean;          // approvalCount >= requiredApprovals
  agentResults: {
    analyst: AgentDecision;
    security: AgentDecision;
    risk: AgentDecision;
  };
  lowestConfidence: number;
  averageConfidence: number;
  reasons: string[];
}

export function checkConsensus(
  panelResult: AgentPanelResult,
  requiredApprovals: number = 2
): ConsensusResult {
  const agents = [
    { name: "Analyst Model", key: "analyst", decision: panelResult.analyst },
    { name: "Security Validator", key: "security", decision: panelResult.security },
    { name: "Risk Assessor", key: "risk", decision: panelResult.risk },
  ];

  let approvalCount = 0;
  const approvingConfidences: number[] = [];
  const reasons: string[] = [];

  for (const agent of agents) {
    if (agent.decision.decision === "approve") {
      approvalCount++;
      approvingConfidences.push(agent.decision.confidence);
      reasons.push(`${agent.name} approved transaction with ${(agent.decision.confidence * 100).toFixed(0)}% confidence.`);
    } else {
      reasons.push(`${agent.name} rejected transaction.`);
    }
  }

  const consensus = approvalCount >= requiredApprovals;
  const lowestConfidence = approvingConfidences.length > 0
    ? Math.min(...approvingConfidences)
    : 0;

  const averageConfidence = approvingConfidences.length > 0
    ? approvingConfidences.reduce((a, b) => a + b, 0) / approvingConfidences.length
    : 0;

  if (consensus) {
    reasons.push(`Consensus threshold met: ${approvalCount} of 3 agents approved (minimum required: ${requiredApprovals}).`);
  } else {
    reasons.push(`Consensus threshold failed: Only ${approvalCount} of 3 agents approved (minimum required: ${requiredApprovals}).`);
  }

  return {
    approvalCount,
    requiredApprovals,
    consensus,
    agentResults: {
      analyst: panelResult.analyst,
      security: panelResult.security,
      risk: panelResult.risk,
    },
    lowestConfidence: Number(lowestConfidence.toFixed(2)),
    averageConfidence: Number(averageConfidence.toFixed(2)),
    reasons,
  };
}
