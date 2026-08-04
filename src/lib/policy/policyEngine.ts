import { AgentDecision } from "../agent/analystAgent";

export interface Policy {
  maxTransactionUsd: number;      // 50 for MVP
  minConfidence: number;           // 0.85 for MVP
  requiredApprovals: number;       // 1 for single agent step
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
  requiredApprovals: 1,
  allowedActions: ["transfer"],
  allowedChainId: 11155111,
};

export function checkPolicy(
  agentDecision: AgentDecision,
  policy: Policy = DEFAULT_MVP_POLICY,
  txDetails: TxDetails
): PolicyResult {
  const ethPrice = txDetails.ethPriceUsd || 3000;
  const amountEthNum = parseFloat(txDetails.amountEth) || 0;
  const txAmountUsd = amountEthNum * ethPrice;

  const agentApproved = agentDecision.decision === "approve";
  const confidenceThreshold = agentDecision.confidence >= policy.minConfidence;
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
  if (!agentApproved) reasons.push("agent_decision_rejected");
  if (!confidenceThreshold) reasons.push(`confidence_below_threshold_${agentDecision.confidence}_vs_${policy.minConfidence}`);
  if (!amountWithinLimit) reasons.push(`amount_exceeds_usd_limit_$${txAmountUsd.toFixed(2)}_vs_$${policy.maxTransactionUsd}`);
  if (!chainAllowed) reasons.push(`chain_id_not_allowed_${txDetails.chainId}_vs_${policy.allowedChainId}`);
  if (!actionAllowed) reasons.push(`action_not_allowed_${txDetails.actionType}`);

  const passed = agentApproved && confidenceThreshold && amountWithinLimit && chainAllowed && actionAllowed;

  return {
    passed,
    checks,
    reasons,
  };
}
