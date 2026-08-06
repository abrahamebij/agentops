import { NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress") || undefined;

    const supabase = createServerClient();

    let query = supabase.from("agent_verdicts").select("agent_name, decision, confidence");
    if (walletAddress) {
      // Resolve the real user UUID from wallet_address, then filter verdicts via executions
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .ilike("wallet_address", walletAddress.trim())
        .maybeSingle();

      if (profile) {
        const { data: userExecs } = await supabase
          .from("executions")
          .select("id")
          .eq("user_id", profile.id);
        const userExecIds = (userExecs || []).map((e) => e.id);
        if (userExecIds.length > 0) {
          query = query.in("execution_id", userExecIds);
        }
      }
    }

    const { data: verdicts } = await query;

    const calcStats = (name: string) => {
      const agentVerdicts = (verdicts || []).filter(
        (v) => v.agent_name.toLowerCase() === name.toLowerCase()
      );
      const total = agentVerdicts.length;
      const approved = agentVerdicts.filter((v) => v.decision === "approve").length;
      const rate = total > 0 ? ((approved / total) * 100).toFixed(1) : "100.0";
      return {
        totalExecutions: total,
        approvalRate: `${rate}%`,
      };
    };

    return NextResponse.json({
      agents: {
        analyst: { ...calcStats("analyst"), version: "v4.2.1-epsilon", latencyMs: 89 },
        security: { ...calcStats("security"), version: "v2.9.0-delta", latencyMs: 142 },
        risk: { ...calcStats("risk"), version: "v3.1.5-gamma", latencyMs: 64 },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch agent stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
