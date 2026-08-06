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

// Resolves the real profile UUID from a wallet address.
async function resolveUserIdFromWallet(
  supabase: ReturnType<typeof createServerClient>,
  walletAddress: string
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("wallet_address", walletAddress.trim())
    .maybeSingle();
  return data ? data.id : null;
}

export async function getUserPolicy(walletAddress?: string): Promise<Policy> {
  const supabase = createServerClient();

  try {
    if (walletAddress) {
      const userId = await resolveUserIdFromWallet(supabase, walletAddress);

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
    }
  } catch (err) {
    console.warn("Failed to fetch user policy from Supabase, falling back to defaults:", err);
  }

  return DEFAULT_MVP_POLICY;
}

export interface PolicyUpdateInput {
  maxTransactionUsd: number;
  minConfidence: number;
  requiredApprovals: number;
  // allowedChainId is fixed at Sepolia for the MVP — not editable
  // allowedActions is fixed to ["transfer"] — the only supported action
}

export async function updateUserPolicy(
  walletAddress: string,
  updates: PolicyUpdateInput
): Promise<Policy | null> {
  const supabase = createServerClient();

  try {
    const userId = await resolveUserIdFromWallet(supabase, walletAddress);
    if (!userId) return null;

    const updateData = {
      user_id: userId,
      max_tx_usd: updates.maxTransactionUsd,
      min_confidence: updates.minConfidence,
      required_approvals: updates.requiredApprovals,
      allowed_chain_id: DEFAULT_MVP_POLICY.allowedChainId,
      allowed_actions: DEFAULT_MVP_POLICY.allowedActions,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("policy_rules")
      .upsert(updateData, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error || !data) {
      console.error("Failed to update policy:", error?.message);
      return null;
    }

    return {
      maxTransactionUsd: Number(data.max_tx_usd),
      minConfidence: Number(data.min_confidence),
      requiredApprovals: Number(data.required_approvals),
      allowedChainId: Number(data.allowed_chain_id),
      allowedActions: Array.isArray(data.allowed_actions)
        ? data.allowed_actions
        : DEFAULT_MVP_POLICY.allowedActions,
    };
  } catch (err) {
    console.error("updateUserPolicy error:", err);
    return null;
  }
}

