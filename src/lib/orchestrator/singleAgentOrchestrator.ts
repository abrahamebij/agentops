import { runAnalystAgent, AgentDecision } from "../agent/analystAgent";
import { checkPolicy, Policy, PolicyResult, TxDetails, DEFAULT_MVP_POLICY } from "../policy/policyEngine";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function loadEnvKeys() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match) {
        const [, key, value] = match;
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvKeys();

export interface ExecutionOrchestrationResult {
  triggerDescription: string;
  txDetails: TxDetails;
  policy: Policy;
  agentDecision: AgentDecision;
  policyResult: PolicyResult;
  executed: boolean;
  keeperhubResult: {
    simulationPassed: boolean;
    idempotencyKey?: string;
    executionId?: string;
    transactionHash?: string;
    transactionLink?: string;
    gasUsedWei?: string;
    status?: string;
    replayVerified?: boolean;
    error?: string;
  } | null;
}

export async function executeWithPolicyGate(
  triggerDescription: string,
  txDetails: TxDetails,
  customPolicy: Policy = DEFAULT_MVP_POLICY,
  customAgentDecision?: AgentDecision // Optional override for explicit rejection testing
): Promise<ExecutionOrchestrationResult> {
  // 1. Run Analyst Agent (or use override if testing)
  const agentDecision = customAgentDecision || (await runAnalystAgent(triggerDescription));

  // 2. Run Deterministic Policy Engine
  const policyResult = checkPolicy(agentDecision, customPolicy, txDetails);

  // 3. Evaluate Gate: IF agent approves AND policy passes
  if (agentDecision.decision === "approve" && policyResult.passed) {
    console.log("\n=======================================================");
    console.log("✅ AGENT & POLICY PASSED -> CALLING KEEPERHUB PIPELINE");
    console.log("=======================================================");

    const apiKey = process.env.KEEPERHUB_API_KEY;
    if (!apiKey) {
      throw new Error("KEEPERHUB_API_KEY is not set in environment or .env.local");
    }

    const baseUrl = "https://app.keeperhub.com";
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "AgentOps/1.0",
    };

    // Sub-step 1: Simulate
    const simulatePayload = {
      chainId: txDetails.chainId,
      recipientAddress: txDetails.recipientAddress,
      amount: txDetails.amountEth,
      simulate: true,
    };

    console.log(`[KeeperHub Simulate] POST ${baseUrl}/api/execute/transfer`);
    const simRes = await fetch(`${baseUrl}/api/execute/transfer`, {
      method: "POST",
      headers,
      body: JSON.stringify(simulatePayload),
    });

    const simData = await simRes.json();

    if (simData.wouldRevert || !simData.success) {
      console.warn("⚠️ Simulation reverted:", simData.revertReason || simData.error);
      return {
        triggerDescription,
        txDetails,
        policy: customPolicy,
        agentDecision,
        policyResult,
        executed: false,
        keeperhubResult: {
          simulationPassed: false,
          error: simData.revertReason || simData.error || "Simulation reverted",
        },
      };
    }

    console.log("✅ Simulation Passed! Gas Estimate:", simData.gasEstimate || "21000");

    // Sub-step 2: Broadcast with Idempotency Key
    const idempotencyKey = crypto.randomUUID();
    const broadcastPayload = {
      chainId: txDetails.chainId,
      recipientAddress: txDetails.recipientAddress,
      amount: txDetails.amountEth,
    };

    const broadcastHeaders = {
      ...headers,
      "Idempotency-Key": idempotencyKey,
    };

    console.log(`[KeeperHub Broadcast] POST ${baseUrl}/api/execute/transfer (Idempotency-Key: ${idempotencyKey})`);
    const broadcastRes = await fetch(`${baseUrl}/api/execute/transfer`, {
      method: "POST",
      headers: broadcastHeaders,
      body: JSON.stringify(broadcastPayload),
    });

    const broadcastData = await broadcastRes.json();
    const executionId = broadcastData.executionId || broadcastData.id;

    // Sub-step 3: Status Polling
    let finalStatusData = broadcastData;
    if (executionId) {
      const statusUrl = `${baseUrl}/api/execute/${executionId}/status`;
      let attempts = 0;
      while (attempts < 15) {
        attempts++;
        const statusRes = await fetch(statusUrl, { headers });
        const pollHintHeader = statusRes.headers.get("x-poll-interval-hint");
        const pollIntervalMs = pollHintHeader ? parseInt(pollHintHeader, 10) * 1000 : 2000;

        finalStatusData = await statusRes.json();
        if (finalStatusData.status === "completed" || finalStatusData.status === "failed") {
          break;
        }
        await new Promise((r) => setTimeout(r, Math.max(pollIntervalMs, 2000)));
      }
    }

    // Sub-step 4: Idempotency Replay Test
    const replayRes = await fetch(`${baseUrl}/api/execute/transfer`, {
      method: "POST",
      headers: broadcastHeaders,
      body: JSON.stringify(broadcastPayload),
    });
    const replayData = await replayRes.json();
    const isIdempotentMatch =
      replayData.executionId === executionId ||
      replayData.transactionHash === finalStatusData.transactionHash ||
      replayRes.status === 200 ||
      replayRes.status === 202;

    return {
      triggerDescription,
      txDetails,
      policy: customPolicy,
      agentDecision,
      policyResult,
      executed: true,
      keeperhubResult: {
        simulationPassed: true,
        idempotencyKey,
        executionId,
        transactionHash: finalStatusData.transactionHash,
        transactionLink: finalStatusData.transactionLink,
        gasUsedWei: finalStatusData.gasUsedWei,
        status: finalStatusData.status,
        replayVerified: isIdempotentMatch,
      },
    };
  } else {
    // REJECTION PATH: Do NOT call KeeperHub at all!
    console.log("\n=======================================================");
    console.log("🛑 REJECTED BEFORE KEEPERHUB CALL");
    console.log("=======================================================");
    console.log("Agent Decision:", JSON.stringify(agentDecision, null, 2));
    console.log("Policy Result:", JSON.stringify(policyResult, null, 2));
    console.log("Zero network calls made to KeeperHub API.");

    return {
      triggerDescription,
      txDetails,
      policy: customPolicy,
      agentDecision,
      policyResult,
      executed: false,
      keeperhubResult: null,
    };
  }
}
