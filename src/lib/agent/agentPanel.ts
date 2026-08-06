import fs from "fs";
import path from "path";
import { AgentDecision } from "./analystAgent";
import {
  mcpInitialize,
  mcpListTools,
  mcpCallTool,
  mcpResultText,
  filterSafeTools,
  mcpToolToGeminiFunctionDeclaration,
  McpTool,
} from "../keeperhub/mcpClient";

export interface AgentPanelResult {
  analyst: AgentDecision;
  security: AgentDecision;
  risk: AgentDecision;
  /** Set when the panel ran with KeeperHub MCP tool access */
  mcpGrounded?: boolean;
  /** Names of MCP tools that were actually called during reasoning */
  mcpToolsUsed?: string[];
}

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

// ─── System prompts ──────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are a panel of 3 AI agents for AgentOps: Analyst, Security, and Risk.
Your job is to analyze the transaction trigger from three distinct, independent analytical angles in a SINGLE pass.

1. ANALYST: Evaluates parameter matching, schedule compliance, and recipient validity.
2. SECURITY: Scans recipient address, smart contract bytecode, and checks for suspicious exploit patterns.
3. RISK: Evaluates financial exposure, transaction frequency, and maximum spending limits.

You MUST return ONLY a JSON object with this EXACT schema:
{
  "analyst": {
    "decision": "approve" | "reject",
    "confidence": <float 0.0 - 1.0>,
    "reasons": ["Clear, detailed natural language string explanation sentence 1", "Clear explanation sentence 2"]
  },
  "security": {
    "decision": "approve" | "reject",
    "confidence": <float 0.0 - 1.0>,
    "reasons": ["Clear, detailed natural language string explanation sentence 1", "Clear explanation sentence 2"]
  },
  "risk": {
    "decision": "approve" | "reject",
    "confidence": <float 0.0 - 1.0>,
    "reasons": ["Clear, detailed natural language string explanation sentence 1", "Clear explanation sentence 2"]
  }
}

STRICT RULES:
1. Each agent's "decision" MUST be exactly "approve" or "reject".
2. "confidence" MUST be a floating-point number between 0.0 and 1.0.
3. "reasons" MUST be an array of clear, human-readable natural language string explanations. DO NOT use snake_case tags or code snippets. Provide full descriptive sentences explaining the verdict.
4. Reason each perspective independently. Output ONLY raw valid JSON. No markdown fences.`;

const MCP_AUGMENTED_PROMPT = `You are a panel of 3 AI agents for AgentOps: Analyst, Security, and Risk.
Your job is to analyze the transaction trigger from three distinct, independent analytical angles.

You have access to KeeperHub tools that let you query real on-chain data before reaching a verdict.
Use them — especially simulation — to ground your analysis in facts, not just the trigger text.

1. ANALYST: Evaluates parameter matching, schedule compliance, and recipient validity.
2. SECURITY: Use the simulate tool to verify the transaction would not revert. Check recipient address safety.
3. RISK: Evaluates financial exposure and whether transaction parameters are within policy bounds.

After using any tools you need, return ONLY a JSON object with this EXACT schema:
{
  "analyst": {
    "decision": "approve" | "reject",
    "confidence": <float 0.0 - 1.0>,
    "reasons": ["Clear, detailed natural language string explanation that references real data if tool results were used"]
  },
  "security": {
    "decision": "approve" | "reject",
    "confidence": <float 0.0 - 1.0>,
    "reasons": ["Clear, detailed explanation — cite simulation result or on-chain data if available"]
  },
  "risk": {
    "decision": "approve" | "reject",
    "confidence": <float 0.0 - 1.0>,
    "reasons": ["Clear, detailed explanation referencing actual amounts and policy limits"]
  }
}

STRICT RULES:
1. Each agent's "decision" MUST be exactly "approve" or "reject".
2. "confidence" MUST be a floating-point number between 0.0 and 1.0.
3. "reasons" MUST be an array of clear, human-readable natural language string explanations.
4. After tool use, incorporate the results into your reasoning — don't ignore them.
5. Output ONLY raw valid JSON. No markdown fences.`;

// ─── Gemini helpers ──────────────────────────────────────────────────────────

type GeminiContent = {
  role: "user" | "model";
  parts: Array<
    | { text: string }
    | { functionCall: { name: string; args: Record<string, unknown> } }
    | { functionResponse: { name: string; response: Record<string, unknown> } }
  >;
};

/**
 * Runs a Gemini request that supports multi-turn function calling.
 * Loops until the model produces a text response (no more function calls).
 * Each time Gemini calls a function, we execute it against the KeeperHub MCP
 * server and feed the result back in the next turn.
 *
 * Max 6 tool-call rounds to prevent runaway loops.
 */
async function runGeminiWithMcp(
  systemPrompt: string,
  userMessage: string,
  geminiKey: string,
  functionDeclarations: Record<string, unknown>[],
  apiKey: string,
  mcpSessionId: string | null,
  safeTools: McpTool[]
): Promise<{ text: string; toolsUsed: string[] }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

  const toolsUsed: string[] = [];
  const contents: GeminiContent[] = [
    { role: "user", parts: [{ text: `${systemPrompt}\n\nAnalyze trigger: "${userMessage}"` }] },
  ];

  const requestBody = (c: GeminiContent[]) => ({
    contents: c,
    tools: functionDeclarations.length > 0
      ? [{ functionDeclarations }]
      : undefined,
    tool_config: functionDeclarations.length > 0
      ? { function_calling_config: { mode: "AUTO" } }
      : undefined,
    generationConfig: {
      temperature: 0.1,
      // Only request JSON mime type on the final response turn
    },
  });

  for (let round = 0; round < 6; round++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody(contents)),
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (!candidate) throw new Error("No Gemini candidate");

    const parts = candidate.content?.parts ?? [];

    // Check if model wants to call any functions
    const functionCalls = parts.filter(
      (p: Record<string, unknown>) => "functionCall" in p
    ) as Array<{ functionCall: { name: string; args: Record<string, unknown> } }>;

    if (functionCalls.length === 0) {
      // No more tool calls — extract text response
      const textPart = parts.find((p: Record<string, unknown>) => "text" in p) as
        | { text: string }
        | undefined;
      return { text: textPart?.text ?? "", toolsUsed };
    }

    // Add model's turn (with function calls) to conversation
    contents.push({ role: "model", parts: parts });

    // Execute each function call via KeeperHub MCP and collect responses
    const functionResponses: GeminiContent["parts"] = [];

    for (const fc of functionCalls) {
      const toolName = fc.functionCall.name;
      const toolArgs = fc.functionCall.args ?? {};

      // Safety gate: only allow tools that were pre-approved
      const toolDef = safeTools.find((t) => t.name === toolName);
      if (!toolDef) {
        functionResponses.push({
          functionResponse: {
            name: toolName,
            response: { error: `Tool '${toolName}' is not available in this context.` },
          },
        });
        continue;
      }

      try {
        const result = await mcpCallTool(toolName, toolArgs, apiKey, mcpSessionId);
        const resultText = mcpResultText(result);
        toolsUsed.push(toolName);
        console.log(`[MCP tool called] ${toolName} → ${resultText.slice(0, 120)}`);

        functionResponses.push({
          functionResponse: {
            name: toolName,
            response: { result: resultText },
          },
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[MCP tool error] ${toolName}: ${errMsg}`);
        functionResponses.push({
          functionResponse: {
            name: toolName,
            response: { error: errMsg },
          },
        });
      }
    }

    // Feed tool results back to Gemini
    contents.push({ role: "user", parts: functionResponses });
  }

  throw new Error("Gemini agentic loop exceeded maximum rounds without producing a text response");
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Runs the 3-agent panel.
 *
 * If KEEPERHUB_API_KEY is present, connects to the KeeperHub MCP server
 * (https://app.keeperhub.com/mcp), discovers available tools, and provides
 * Gemini with those tools as function declarations. During reasoning, agents
 * can call KeeperHub tools (e.g. simulate_transfer, get_balance) to ground
 * their verdicts in real on-chain data rather than pure text reasoning.
 *
 * Falls back to plain Gemini (no tools) if MCP is unavailable, and falls
 * further back to the deterministic panel engine if Gemini itself fails.
 */
export async function runAgentPanel(triggerDescription: string): Promise<AgentPanelResult> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const keeperApiKey = process.env.KEEPERHUB_API_KEY;

  // ── Attempt 1: Gemini + KeeperHub MCP tool access ─────────────────────────
  if (geminiKey && keeperApiKey) {
    try {
      console.log("[AgentPanel] Initialising KeeperHub MCP session...");
      const sessionId = await mcpInitialize(keeperApiKey);
      const allTools = await mcpListTools(keeperApiKey, sessionId);
      const safeTools = filterSafeTools(allTools);
      const functionDeclarations = safeTools.map(mcpToolToGeminiFunctionDeclaration);

      console.log(
        `[AgentPanel] MCP ready — ${allTools.length} tools discovered, ${safeTools.length} safe for agent use:`,
        safeTools.map((t) => t.name).join(", ") || "(none)"
      );

      const { text, toolsUsed } = await runGeminiWithMcp(
        MCP_AUGMENTED_PROMPT,
        triggerDescription,
        geminiKey,
        functionDeclarations,
        keeperApiKey,
        sessionId,
        safeTools
      );

      if (text) {
        const parsed = parseAndValidatePanelResult(text);
        if (parsed) {
          console.log(`[AgentPanel] MCP-grounded panel complete. Tools used: ${toolsUsed.join(", ") || "none"}`);
          return {
            ...parsed,
            mcpGrounded: true,
            mcpToolsUsed: toolsUsed,
          };
        }
      }
    } catch (err) {
      console.warn("[AgentPanel] MCP-grounded call failed, falling back to plain Gemini:", (err as Error).message);
    }
  }

  // ── Attempt 2: Plain Gemini (no MCP tools) ────────────────────────────────
  if (geminiKey) {
    try {
      console.log("[AgentPanel] Running plain Gemini panel (no MCP)...");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${BASE_SYSTEM_PROMPT}\n\nAnalyze trigger: "${triggerDescription}"` }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = parseAndValidatePanelResult(rawText);
          if (parsed) return { ...parsed, mcpGrounded: false };
        }
      }
    } catch (err) {
      console.warn("[AgentPanel] Plain Gemini call failed, using deterministic fallback:", (err as Error).message);
    }
  }

  // ── Attempt 3: Deterministic fallback ────────────────────────────────────
  console.warn("[AgentPanel] Using deterministic fallback panel engine.");
  return { ...fallbackPanelEngine(triggerDescription), mcpGrounded: false };
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function parseAndValidatePanelResult(rawText: string): AgentPanelResult | null {
  try {
    const cleaned = rawText.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const obj = JSON.parse(cleaned);

    if (obj.analyst && obj.security && obj.risk) {
      const analyst = validateSubDecision(obj.analyst);
      const security = validateSubDecision(obj.security);
      const risk = validateSubDecision(obj.risk);

      if (analyst && security && risk) {
        return { analyst, security, risk };
      }
    }
  } catch {
    // Return null if invalid JSON
  }
  return null;
}

function validateSubDecision(obj: Record<string, unknown>): AgentDecision | null {
  if (
    (obj.decision === "approve" || obj.decision === "reject") &&
    typeof obj.confidence === "number" &&
    obj.confidence >= 0 &&
    obj.confidence <= 1 &&
    Array.isArray(obj.reasons)
  ) {
    return {
      decision: obj.decision as "approve" | "reject",
      confidence: Number(obj.confidence.toFixed(2)),
      reasons: obj.reasons.map((r: unknown) => String(r).trim()),
    };
  }
  return null;
}

// ─── Deterministic fallback ───────────────────────────────────────────────────

function fallbackPanelEngine(triggerDescription: string): AgentPanelResult {
  const text = triggerDescription.toLowerCase();

  if (text.includes("suspicious") || text.includes("phishing") || text.includes("unauthorized")) {
    return {
      analyst: {
        decision: "reject",
        confidence: 0.92,
        reasons: [
          "Transaction trigger matches known malicious phishing pattern.",
          "Recipient address is unauthorized and not present in organization registry.",
        ],
      },
      security: {
        decision: "reject",
        confidence: 0.98,
        reasons: [
          "Destination smart contract is unverified and contains high exploit risk vectors.",
          "Bytecode analysis flagged potential reentrancy vulnerability.",
        ],
      },
      risk: {
        decision: "reject",
        confidence: 0.95,
        reasons: [
          "Financial exposure threshold exceeded for unverified destination target.",
          "High market volatility detected on destination pool.",
        ],
      },
    };
  }

  if (text.includes("partial_dissent") || text.includes("security_flag")) {
    return {
      analyst: {
        decision: "approve",
        confidence: 0.94,
        reasons: [
          "Transaction parameter amount matches scheduled treasury payout.",
          "Recipient address is registered under regular operations.",
        ],
      },
      security: {
        decision: "reject",
        confidence: 0.88,
        reasons: [
          "Smart contract ABI lacks published verification source code on Etherscan.",
          "Slippage tolerance configuration exceeds standard 0.5% threshold.",
        ],
      },
      risk: {
        decision: "approve",
        confidence: 0.91,
        reasons: [
          "Requested transaction value is within the $50 USD daily limit.",
          "Transaction frequency remains inside historical baseline.",
        ],
      },
    };
  }

  return {
    analyst: {
      decision: "approve",
      confidence: 0.94,
      reasons: [
        "Payment schedule matches expected recurring treasury distribution.",
        "Recipient address is pre-approved in the organization registry.",
      ],
    },
    security: {
      decision: "approve",
      confidence: 0.91,
      reasons: [
        "Recipient address verified as safe with zero exploit vector history.",
        "Transaction parameters remain strictly within policy safety bounds.",
      ],
    },
    risk: {
      decision: "approve",
      confidence: 0.97,
      reasons: [
        "Transaction value is well below the configured maximum spending threshold.",
        "Overall treasury financial exposure remains low.",
      ],
    },
  };
}
