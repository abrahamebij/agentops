import fs from "fs";
import path from "path";
import { AgentPanelResult } from "../agent/agentPanel";
import { ConsensusResult } from "../consensus/consensusEngine";
import { PolicyResult } from "../policy/policyEngine";
import { KeeperHubExecutionResult } from "../orchestrator/multiAgentOrchestrator";

export interface StoredExecutionRecord {
  id: string;
  triggerDescription: string;
  amountEth: string;
  amountUsd: string;
  recipientAddress: string;
  timestamp: string;
  createdAt: string;
  executed: boolean;
  status: "confirmed" | "rejected" | "running";
  decision: "EXECUTE" | "REJECT";
  panelResult: AgentPanelResult;
  consensusResult: ConsensusResult;
  policyResult: PolicyResult;
  keeperhubResult: KeeperHubExecutionResult | null;
}

const DATA_FILE = path.join(process.cwd(), ".agentops_executions.json");

export function getExecutions(): StoredExecutionRecord[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to read executions data file:", err);
  }
  return [];
}

export function getExecutionById(id: string): StoredExecutionRecord | null {
  const records = getExecutions();
  return records.find((r) => r.id === id) || null;
}

export function saveExecutions(records: StoredExecutionRecord[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write executions data file:", err);
  }
}

export function addExecution(record: StoredExecutionRecord): void {
  const records = getExecutions();
  const updated = [record, ...records];
  saveExecutions(updated);
}
