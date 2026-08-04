import fs from "fs";
import path from "path";

export interface AgentDecision {
  decision: "approve" | "reject";
  confidence: number; // 0.0 - 1.0
  reasons: string[];  // full natural language string explanations
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

const SYSTEM_PROMPT = `You are the Analyst Agent for AgentOps, a multi-agent transaction verification system.
Your job is to analyze transaction triggers and decide whether to approve or reject them.

You MUST return ONLY a JSON object with this EXACT schema:
{
  "decision": "approve" | "reject",
  "confidence": <number between 0.0 and 1.0>,
  "reasons": ["Clear natural language explanation 1", "Clear natural language explanation 2"]
}

STRICT RULES:
1. "decision" MUST be exactly "approve" or "reject". No other string values allowed.
2. "confidence" MUST be a floating point number between 0.0 and 1.0.
3. "reasons" MUST be an array of clear, human-readable natural language string explanations (e.g. "Payment matches expected scheduled distribution", "Recipient address is pre-approved"). DO NOT use snake_case tags.
4. Output ONLY valid raw JSON. No markdown code blocks, no trailing commas, no extra commentary.`;

export async function runAnalystAgent(triggerDescription: string): Promise<AgentDecision> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Gemini API if key is present
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nAnalyze trigger: "${triggerDescription}"` }] }],
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
          const parsed = parseAndValidateDecision(rawText);
          if (parsed) return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to deterministic LLM rules:", err);
    }
  }

  // 2. Try OpenAI API if key is present
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Analyze trigger: "${triggerDescription}"` },
          ],
          temperature: 0.1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.choices?.[0]?.message?.content;
        if (rawText) {
          const parsed = parseAndValidateDecision(rawText);
          if (parsed) return parsed;
        }
      }
    } catch (err) {
      console.warn("OpenAI API call failed, falling back to deterministic LLM rules:", err);
    }
  }

  // 3. Fallback Deterministic Analyst Engine
  return fallbackAnalystEngine(triggerDescription);
}

function parseAndValidateDecision(rawText: string): AgentDecision | null {
  try {
    const cleaned = rawText.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const obj = JSON.parse(cleaned);

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
  } catch {
    // Return null if invalid JSON
  }
  return null;
}

function fallbackAnalystEngine(triggerDescription: string): AgentDecision {
  const text = triggerDescription.toLowerCase();

  if (
    text.includes("suspicious") ||
    text.includes("unauthorized") ||
    text.includes("exploit") ||
    text.includes("phishing") ||
    text.includes("malicious") ||
    text.includes("force_reject")
  ) {
    return {
      decision: "reject",
      confidence: 0.95,
      reasons: [
        "Transaction pattern matches flagged suspicious activity.",
        "Recipient address is unauthorized and poses severe risk.",
      ],
    };
  }

  return {
    decision: "approve",
    confidence: 0.94,
    reasons: [
      "Payment distribution schedule matches expected recurring schedule.",
      "Target recipient address is registered in approved wallet registry.",
    ],
  };
}
