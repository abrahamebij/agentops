/**
 * KeeperHub MCP Client
 *
 * Speaks the Model Context Protocol (JSON-RPC 2.0) over HTTP to
 * https://app.keeperhub.com/mcp — KeeperHub's hosted remote MCP server.
 *
 * Protocol: MCP Streamable HTTP (2025-03-26 spec)
 * Auth: Bearer token via KEEPERHUB_API_KEY
 *
 * The client handles both plain-JSON and SSE-streamed responses so it works
 * regardless of which response format the server chooses for a given request.
 */

const MCP_ENDPOINT = "https://app.keeperhub.com/mcp";

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpToolResult {
  content: Array<{ type: string; text?: string; [k: string]: unknown }>;
  isError?: boolean;
}

let _reqId = 1;
function nextId() {
  return _reqId++;
}

/**
 * Core JSON-RPC over HTTP POST.
 * Handles both application/json and text/event-stream response formats.
 */
async function mcpRpc(
  method: string,
  params: Record<string, unknown>,
  apiKey: string,
  sessionId?: string
): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": "AgentOps/1.0",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: nextId(),
    method,
    params,
  });

  const res = await fetch(MCP_ENDPOINT, { method: "POST", headers, body });

  if (!res.ok && res.status !== 200) {
    throw new Error(`MCP HTTP ${res.status}: ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") ?? "";

  // SSE response — parse the event stream and extract the first result/error
  if (contentType.includes("text/event-stream")) {
    const text = await res.text();
    for (const line of text.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const msg = JSON.parse(raw);
        if (msg.error) throw new Error(msg.error.message ?? "MCP error");
        if (msg.result !== undefined) return msg.result;
      } catch (parseErr) {
        // not JSON — skip
        void parseErr;
      }
    }
    return null;
  }

  // Plain JSON response
  const data = await res.json();
  if (data.error) throw new Error(data.error.message ?? "MCP error");
  return data.result ?? null;
}

/**
 * Initialises an MCP session with the KeeperHub server.
 * Returns the session ID if the server provides one.
 */
export async function mcpInitialize(apiKey: string): Promise<string | null> {
  try {
    const result = (await mcpRpc(
      "initialize",
      {
        protocolVersion: "2024-11-05",
        capabilities: { roots: {}, sampling: {} },
        clientInfo: { name: "AgentOps", version: "1.0.0" },
      },
      apiKey
    )) as { sessionId?: string } | null;
    return result?.sessionId ?? null;
  } catch (err) {
    console.warn("[MCP] Initialize failed:", (err as Error).message);
    return null;
  }
}

/**
 * Discovers all tools exposed by the KeeperHub MCP server.
 * Returns an empty array if the server is unreachable.
 */
export async function mcpListTools(
  apiKey: string,
  sessionId?: string | null
): Promise<McpTool[]> {
  try {
    const result = (await mcpRpc(
      "tools/list",
      {},
      apiKey,
      sessionId ?? undefined
    )) as { tools?: McpTool[] } | null;
    return result?.tools ?? [];
  } catch (err) {
    console.warn("[MCP] tools/list failed:", (err as Error).message);
    return [];
  }
}

/**
 * Calls a specific MCP tool by name with the given arguments.
 * Throws if the tool call fails (isError: true from server, or HTTP error).
 */
export async function mcpCallTool(
  name: string,
  args: Record<string, unknown>,
  apiKey: string,
  sessionId?: string | null
): Promise<McpToolResult> {
  const result = (await mcpRpc(
    "tools/call",
    { name, arguments: args },
    apiKey,
    sessionId ?? undefined
  )) as McpToolResult | null;

  if (!result) {
    return { content: [{ type: "text", text: "No result from tool call" }], isError: true };
  }
  if (result.isError) {
    const errText = result.content?.map((c) => c.text).join(" ") ?? "Tool error";
    throw new Error(`[MCP tool ${name}] ${errText}`);
  }
  return result;
}

/**
 * Convenience: extract the text payload from an MCP tool result.
 */
export function mcpResultText(result: McpToolResult): string {
  return result.content
    .filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text as string)
    .join("\n");
}

/**
 * Safe tools: read-only KeeperHub tools that agents are allowed to call
 * during reasoning. Execute/write tools are intentionally excluded — agents
 * only analyse; the orchestrator handles execution after consensus passes.
 */
const SAFE_TOOL_PREFIXES = [
  "simulate",
  "get_",
  "read_",
  "check_",
  "estimate_",
  "list_",
  "fetch_",
  "balance",
  "status",
  "audit",
];

export function filterSafeTools(tools: McpTool[]): McpTool[] {
  return tools.filter((t) =>
    SAFE_TOOL_PREFIXES.some((prefix) => t.name.toLowerCase().startsWith(prefix))
  );
}

/**
 * Convert an MCP tool schema into a Gemini function declaration.
 * Gemini uses "OBJECT" (uppercase) for type names.
 */
export function mcpToolToGeminiFunctionDeclaration(tool: McpTool): Record<string, unknown> {
  // Deep-clone and uppercase the "type" fields for Gemini compatibility
  function uppercaseTypes(schema: unknown): unknown {
    if (typeof schema !== "object" || schema === null) return schema;
    if (Array.isArray(schema)) return schema.map(uppercaseTypes);
    const obj = schema as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = k === "type" && typeof v === "string" ? v.toUpperCase() : uppercaseTypes(v);
    }
    return out;
  }

  return {
    name: tool.name,
    description: tool.description,
    parameters: uppercaseTypes(tool.inputSchema),
  };
}
