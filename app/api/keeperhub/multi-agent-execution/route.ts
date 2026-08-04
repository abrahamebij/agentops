import { NextResponse } from "next/server";
import { executeMultiAgentFlow } from "@/src/lib/orchestrator/multiAgentOrchestrator";
import { DEFAULT_MVP_POLICY, TxDetails } from "@/src/lib/policy/policyEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    const policy = {
      ...DEFAULT_MVP_POLICY,
      ...(body.maxTransactionUsd ? { maxTransactionUsd: body.maxTransactionUsd } : {}),
      ...(body.requiredApprovals ? { requiredApprovals: body.requiredApprovals } : {}),
    };

    const result = await executeMultiAgentFlow(triggerDescription, txDetails, policy);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to execute multi-agent flow";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
