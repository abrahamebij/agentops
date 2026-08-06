"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StoredExecutionRecord } from "../lib/db/executionsStore";

export function useExecutions(walletAddress?: string) {
  return useQuery<StoredExecutionRecord[]>({
    queryKey: ["executions", walletAddress],
    queryFn: async () => {
      const url = walletAddress
        ? `/api/keeperhub/multi-agent-execution?walletAddress=${walletAddress}`
        : "/api/keeperhub/multi-agent-execution";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch executions");
      const data = await res.json();
      return data.executions || [];
    },
    refetchInterval: 15000, // Refresh execution status every 15s
  });
}

export function useExecutionDetail(id: string, walletAddress?: string) {
  return useQuery<StoredExecutionRecord | null>({
    queryKey: ["execution", id, walletAddress],
    queryFn: async () => {
      if (!id) return null;
      const url = walletAddress
        ? `/api/keeperhub/executions/${id}?walletAddress=${walletAddress}`
        : `/api/keeperhub/executions/${id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch execution detail");
      const data = await res.json();
      return data.execution || null;
    },
    enabled: Boolean(id),
  });
}

export function useInvalidateExecutions() {
  const queryClient = useQueryClient();
  return (walletAddress?: string) => {
    queryClient.invalidateQueries({ queryKey: ["executions"] });
    if (walletAddress) {
      queryClient.invalidateQueries({ queryKey: ["executions", walletAddress] });
    }
  };
}
