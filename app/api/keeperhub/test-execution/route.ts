import { NextResponse } from "next/server";
import crypto from "crypto";

const BASE_URL = "https://app.keeperhub.com";

interface KeeperChain {
  chainId: number;
  isEnabled: boolean;
  isTestnet: boolean;
  [key: string]: unknown;
}

export async function GET() {
  const apiKey = process.env.KEEPERHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "KEEPERHUB_API_KEY is not set" }, { status: 500 });
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "AgentOps/1.0",
  };

  try {
    // 1. Confirm Chain
    const chainsRes = await fetch(`${BASE_URL}/api/chains`, { headers });
    const chains = await chainsRes.json();
    const sepolia = chains.find((c: KeeperChain) => c.chainId === 11155111);

    if (!sepolia || !sepolia.isEnabled || !sepolia.isTestnet) {
      return NextResponse.json(
        { error: "Ethereum Sepolia chain (11155111) is not enabled or not testnet", sepolia },
        { status: 400 }
      );
    }

    // 2. Simulate Transfer
    const recipientAddress = "0x000000000000000000000000000000000000dEaD";
    const amount = "0.0001";
    const simulatePayload = {
      chainId: 11155111,
      recipientAddress,
      amount,
      simulate: true,
    };

    const simRes = await fetch(`${BASE_URL}/api/execute/transfer`, {
      method: "POST",
      headers,
      body: JSON.stringify(simulatePayload),
    });

    const simData = await simRes.json();

    if (simData.wouldRevert || !simData.success) {
      return NextResponse.json({
        step: "simulation",
        status: "reverted_or_insufficient_funds",
        orgWalletAddress: simData.from || "0x97271d60c7e41de4f2d37752008e3c18e9108b12",
        revertReason: simData.revertReason || simData.error,
        balanceWei: simData.balanceWei || "0",
        requiredWei: simData.requiredWei || "100000000000000",
        simulationResponse: simData,
        message: `Fund wallet ${simData.from || "0x97271d60c7e41de4f2d37752008e3c18e9108b12"} with Sepolia ETH to broadcast real onchain transaction.`,
      });
    }

    // 3. Broadcast Transfer with Idempotency Key
    const idempotencyKey = crypto.randomUUID();
    const broadcastPayload = {
      chainId: 11155111,
      recipientAddress,
      amount,
    };

    const broadcastRes = await fetch(`${BASE_URL}/api/execute/transfer`, {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(broadcastPayload),
    });

    const broadcastData = await broadcastRes.json();
    const executionId = broadcastData.executionId || broadcastData.id;

    // 4. Poll Status
    let statusData = broadcastData;
    if (executionId) {
      const statusRes = await fetch(`${BASE_URL}/api/execute/${executionId}/status`, { headers });
      statusData = await statusRes.json();
    }

    // 5. Idempotency Replay Test
    const replayRes = await fetch(`${BASE_URL}/api/execute/transfer`, {
      method: "POST",
      headers: { ...headers, "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(broadcastPayload),
    });
    const replayData = await replayRes.json();

    return NextResponse.json({
      step: "complete",
      sepoliaConfirmed: true,
      simulationPassed: true,
      idempotencyKey,
      executionId,
      transactionHash: statusData.transactionHash,
      transactionLink: statusData.transactionLink,
      gasUsedWei: statusData.gasUsedWei,
      status: statusData.status,
      idempotencyReplayResult: replayData,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
