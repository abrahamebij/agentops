"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Policy } from "../lib/policy/policyEngine";

export function usePolicy(walletAddress?: string) {
  return useQuery<Policy>({
    queryKey: ["policy", walletAddress],
    queryFn: async () => {
      const url = walletAddress
        ? `/api/keeperhub/policy?walletAddress=${walletAddress}`
        : "/api/keeperhub/policy";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch policy");
      const data = await res.json();
      return data.policy;
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      walletAddress: string;
      maxTransactionUsd: number;
      minConfidence: number;
      requiredApprovals: number;
    }) => {
      const res = await fetch("/api/keeperhub/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update policy");
      }
      return data.policy as Policy;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["policy", variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["policy"] });
    },
  });
}
