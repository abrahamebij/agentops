import { executeMultiAgentFlow } from "@/src/lib/orchestrator/multiAgentOrchestrator";
import { TxDetails } from "@/src/lib/policy/policyEngine";
import { getUserPolicy } from "@/src/lib/policy/policyDb";
import { getExecutions, addExecution, StoredExecutionRecord } from "@/src/lib/db/executionsStore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress") || undefined;

    const records = await getExecutions(walletAddress);
    return NextResponse.json({ executions: records });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch executions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const walletAddress = body.walletAddress || undefined;

    // All three fields are required — no hardcoded fallbacks.
    // The form must provide real user input before the pipeline runs.
    const triggerDescription = body.triggerDescription as string | undefined;
    const recipientAddress = body.recipientAddress as string | undefined;
    const amountEth = body.amountEth as string | undefined;

    if (!triggerDescription || !recipientAddress || !amountEth) {
      return NextResponse.json(
        { error: "triggerDescription, recipientAddress, and amountEth are required." },
        { status: 400 }
      );
    }

    const txDetails: TxDetails = {
      chainId: body.chainId || 11155111,
      recipientAddress,
      amountEth,
      actionType: "transfer",
      ethPriceUsd: 3000,
    };

    // Fetch user's policy from Supabase (or auto-seeded defaults)
    const basePolicy = await getUserPolicy(walletAddress);
    const customPolicy = {
      ...basePolicy,
      ...(body.maxTransactionUsd ? { maxTransactionUsd: body.maxTransactionUsd } : {}),
      ...(body.requiredApprovals ? { requiredApprovals: body.requiredApprovals } : {}),
    };

    // Build a streaming SSE response.
    // The client reads events via fetch + response.body.getReader() as each stage fires.
    const encoder = new TextEncoder();
    let streamController: ReadableStreamDefaultController<Uint8Array>;

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller;
      },
    });

    function emit(stage: string, data?: unknown) {
      try {
        const payload = JSON.stringify({ stage, data: data ?? null });
        streamController.enqueue(encoder.encode(`data: ${payload}\n\n`));
      } catch {
        // Stream may already be closed
      }
    }

    // Run the pipeline asynchronously while the stream stays open
    (async () => {
      try {
        const result = await executeMultiAgentFlow(
          triggerDescription,
          txDetails,
          customPolicy,
          undefined,
          emit
        );

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
          mcpGrounded: result.panelResult.mcpGrounded ?? false,
          mcpToolsUsed: result.panelResult.mcpToolsUsed ?? [],
        };


        // Persist to Supabase
        await addExecution(newRecord, walletAddress);

        // Final "done" event carries the full stored record for the client to add to the list
        emit("done", { storedRecord: newRecord, result });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Execution failed";
        emit("error", { message });
      } finally {
        streamController.close();
      }
    })();

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to start execution";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
