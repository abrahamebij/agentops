import { NextResponse } from "next/server";
import { executeMultiAgentFlow } from "@/src/lib/orchestrator/multiAgentOrchestrator";
import { TxDetails } from "@/src/lib/policy/policyEngine";
import { getUserPolicy } from "@/src/lib/policy/policyDb";
import { getExecutions, addExecution, StoredExecutionRecord } from "@/src/lib/db/executionsStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;

    const records = await getExecutions(userId);
    return NextResponse.json({ executions: records });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch executions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body.userId || undefined;

    const triggerDescription =
      body.triggerDescription ||
      "Scheduled treasury payment: transfer 0.0001 ETH to approved wallet 0x97271d60c7e41de4f2d37752008e3c18e9108b12";

    const txDetails: TxDetails = {
      chainId: body.chainId || 11155111,
      recipientAddress:
        body.recipientAddress || "0x97271d60c7e41de4f2d37752008e3c18e9108b12",
      amountEth: body.amountEth || "0.0001",
      actionType: body.actionType || "transfer",
      ethPriceUsd: 3000,
    };

    // 1. Fetch user's dynamic policy rules from Supabase (or auto-seeded defaults)
    const basePolicy = await getUserPolicy(userId);
    const customPolicy = {
      ...basePolicy,
      ...(body.maxTransactionUsd ? { maxTransactionUsd: body.maxTransactionUsd } : {}),
      ...(body.requiredApprovals ? { requiredApprovals: body.requiredApprovals } : {}),
    };

    // 2. Execute Orchestration (Single LLM Gemini Call -> Consensus -> Policy Check -> KeeperHub)
    const result = await executeMultiAgentFlow(triggerDescription, txDetails, customPolicy);

    const amountEthNum = parseFloat(txDetails.amountEth) || 0;
    const amountUsdVal = amountEthNum * 3000;
    const newId = `T-${Math.floor(84921 + Math.random() * 1000)}`;

    const newRecord: StoredExecutionRecord = {
      id: newId,
      triggerDescription,
      amountEth: `${txDetails.amountEth} ETH`,
      amountUsd: `$${amountUsdVal.toFixed(2)} USD`,
      recipientAddress: txDetails.recipientAddress,
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
      executed: result.executed,
      status: result.executed ? "confirmed" : "rejected",
      decision: result.executed ? "EXECUTE" : "REJECT",
      panelResult: result.panelResult,
      consensusResult: result.consensusResult,
      policyResult: result.policyResult,
      keeperhubResult: result.keeperhubResult,
    };

    // 3. Insert into Supabase executions + agent_verdicts tables
    await addExecution(newRecord, userId);

    return NextResponse.json({ ...result, storedRecord: newRecord });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to execute multi-agent flow";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
