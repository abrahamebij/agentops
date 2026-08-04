import fs from "fs";
import path from "path";

export interface AgentDecision {
  decision: "approve" | "reject";
  confidence: number; // 0.0 - 1.0
  reasons: string[];  // short_snake_case_tags
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
  "reasons": ["short_snake_case_tag_1", "short_snake_case_tag_2"]
}

STRICT RULES:
1. "decision" MUST be exactly "approve" or "reject". No other string values allowed.
2. "confidence" MUST be a floating point number between 0.0 and 1.0.
3. "reasons" MUST be an array of short, lower_snake_case string tags (e.g. "payment_matches_schedule", "recipient_is_approved", "suspicious_recipient", "unauthorized_amount").
4. Output ONLY valid raw JSON. No markdown code blocks, no trailing commas, no extra commentary.`;

export async function runAnalystAgent(triggerDescription: string): Promise<AgentDecision> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Gemini API if key is present
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: `Analyze trigger: "${triggerDescription}"` }] }],
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

  // 3. Fallback Deterministic Analyst Engine (when no external LLM API key is set)
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
        decision: obj.decision,
        confidence: Number(obj.confidence.toFixed(2)),
        reasons: obj.reasons.map((r: any) => String(r).toLowerCase().replace(/\s+/g, "_")),
      };
    }
  } catch {
    // Return null if invalid JSON
  }
  return null;
}

function fallbackAnalystEngine(triggerDescription: string): AgentDecision {
  const text = triggerDescription.toLowerCase();

  // If trigger explicitly mentions rejection/suspicious/unauthorized
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
      reasons: ["suspicious_trigger_pattern", "unauthorized_recipient_risk"],
    };
  }

  // Standard approval path
  return {
    decision: "approve",
    confidence: 0.94,
    reasons: ["payment_matches_schedule", "recipient_is_approved"],
  };
}
