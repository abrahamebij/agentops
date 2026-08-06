"use client";

import { useQuery } from "@tanstack/react-query";

export interface AgentStat {
  totalExecutions: number;
  approvalRate: string;
  version: string;
  latencyMs: number;
}

export interface AgentStatsMap {
  analyst: AgentStat;
  security: AgentStat;
  risk: AgentStat;
}

export function useAgentStats(walletAddress?: string) {
  return useQuery<AgentStatsMap>({
    queryKey: ["agents", walletAddress],
    queryFn: async () => {
      const url = walletAddress
        ? `/api/keeperhub/agents?walletAddress=${walletAddress}`
        : "/api/keeperhub/agents";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch agent statistics");
      const data = await res.json();
      return data.agents;
    },
    refetchInterval: 30000,
  });
}
