import { AgentDecision } from "../agent/analystAgent";
import { ConsensusResult } from "../consensus/consensusEngine";

export interface Policy {
  maxTransactionUsd: number;      // 50 for MVP
  minConfidence: number;           // 0.85 for MVP
  requiredApprovals: number;       // 2 out of 3 for multi-agent consensus
  allowedActions: string[];        // ["transfer"]
  allowedChainId: number;          // 11155111 (Sepolia)
}

export interface TxDetails {
  chainId: number;
  recipientAddress: string;
  amountEth: string;
  actionType: string;
  ethPriceUsd?: number;
}

export interface PolicyResult {
  passed: boolean;
  checks: {
    agentApproved: boolean;
    confidenceThreshold: boolean;
    amountWithinLimit: boolean;
    chainAllowed: boolean;
    actionAllowed: boolean;
  };
  reasons: string[];
}

export const DEFAULT_MVP_POLICY: Policy = {
  maxTransactionUsd: 50,
  minConfidence: 0.85,
  requiredApprovals: 2,
  allowedActions: ["transfer"],
  allowedChainId: 11155111,
};

export function checkPolicy(
  decisionInput: AgentDecision | ConsensusResult,
  policy: Policy = DEFAULT_MVP_POLICY,
  txDetails: TxDetails
): PolicyResult {
  const ethPrice = txDetails.ethPriceUsd || 3000;
  const amountEthNum = parseFloat(txDetails.amountEth) || 0;
  const txAmountUsd = amountEthNum * ethPrice;

  let agentApproved = false;
  let confidenceVal = 0;

  if ("consensus" in decisionInput) {
    // ConsensusResult Input: Uses average confidence across approving agents
    agentApproved = decisionInput.consensus;
    confidenceVal = decisionInput.averageConfidence;
  } else {
    // Single AgentDecision Input
    agentApproved = decisionInput.decision === "approve";
    confidenceVal = decisionInput.confidence;
  }

  const confidenceThreshold = confidenceVal >= policy.minConfidence;
  const amountWithinLimit = txAmountUsd <= policy.maxTransactionUsd;
  const chainAllowed = txDetails.chainId === policy.allowedChainId;
  const actionAllowed = policy.allowedActions.includes(txDetails.actionType);

  const checks = {
    agentApproved,
    confidenceThreshold,
    amountWithinLimit,
    chainAllowed,
    actionAllowed,
  };

  const reasons: string[] = [];
  if (!agentApproved) {
    reasons.push("Agent consensus or verdict rejected the transaction.");
  }
  if (!confidenceThreshold) {
    reasons.push(`Agent average confidence (${(confidenceVal * 100).toFixed(0)}%) is below the minimum required policy threshold (${(policy.minConfidence * 100).toFixed(0)}%).`);
  }
  if (!amountWithinLimit) {
    reasons.push(`Transaction amount ($${txAmountUsd.toFixed(2)} USD) exceeds the maximum policy spending limit ($${policy.maxTransactionUsd.toFixed(2)} USD).`);
  }
  if (!chainAllowed) {
    reasons.push(`Target chain ID ${txDetails.chainId} is not allowed by policy (allowed chain: ${policy.allowedChainId}).`);
  }
  if (!actionAllowed) {
    reasons.push(`Action type "${txDetails.actionType}" is not permitted under active policy rules.`);
  }

  const passed = agentApproved && confidenceThreshold && amountWithinLimit && chainAllowed && actionAllowed;

  return {
    passed,
    checks,
    reasons,
  };
}
