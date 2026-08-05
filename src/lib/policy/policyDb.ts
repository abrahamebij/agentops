import { createServerClient } from "../supabase/server";
import { Policy, DEFAULT_MVP_POLICY } from "./policyEngine";

export interface StoredPolicyRule {
  id?: string;
  user_id?: string;
  max_tx_usd: number;
  min_confidence: number;
  required_approvals: number;
  allowed_chain_id: number;
  allowed_actions: string[];
}

export async function getUserPolicy(userId?: string): Promise<Policy> {
  const supabase = createServerClient();

  try {
    if (userId) {
      const { data, error } = await supabase
        .from("policy_rules")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        return {
          maxTransactionUsd: Number(data.max_tx_usd),
          minConfidence: Number(data.min_confidence),
          requiredApprovals: Number(data.required_approvals),
          allowedChainId: Number(data.allowed_chain_id),
          allowedActions: Array.isArray(data.allowed_actions)
            ? data.allowed_actions
            : DEFAULT_MVP_POLICY.allowedActions,
        };
      }

      // Auto-seed default policy if no row exists for this user
      const seedData = {
        user_id: userId,
        max_tx_usd: DEFAULT_MVP_POLICY.maxTransactionUsd,
        min_confidence: DEFAULT_MVP_POLICY.minConfidence,
        required_approvals: DEFAULT_MVP_POLICY.requiredApprovals,
        allowed_chain_id: DEFAULT_MVP_POLICY.allowedChainId,
        allowed_actions: DEFAULT_MVP_POLICY.allowedActions,
        updated_at: new Date().toISOString(),
      };

      const { data: inserted } = await supabase
        .from("policy_rules")
        .insert(seedData)
        .select("*")
        .single();

      if (inserted) {
        return {
          maxTransactionUsd: Number(inserted.max_tx_usd),
          minConfidence: Number(inserted.min_confidence),
          requiredApprovals: Number(inserted.required_approvals),
          allowedChainId: Number(inserted.allowed_chain_id),
          allowedActions: Array.isArray(inserted.allowed_actions)
            ? inserted.allowed_actions
            : DEFAULT_MVP_POLICY.allowedActions,
        };
      }
    }
  } catch (err) {
    console.warn("Failed to fetch user policy from Supabase, falling back to defaults:", err);
  }

  return DEFAULT_MVP_POLICY;
}
