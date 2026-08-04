# AgentOps — Build Brief
## KeeperHub Agents Onchain Hackathon

**Deadline:** 13 August 2026, 11:00 UTC+2
**Prize target:** 1st/2nd/3rd ($2,000/$1,200/$800) + Best Onboarding UX ($1,000 split two ways — separate, independently judged track)
**Stack:** Next.js + TypeScript end-to-end. Ethereum Sepolia (`chainId: 11155111`) for the real onchain transaction. PostgreSQL for persistence.
**GitHub:** @abrahamebij

**One-line pitch:** AI decides. Agents verify. KeeperHub executes.

---

## 0. Build Order (do not deviate)

The brief's own priority list is correct and the hackathon's judging weight on "Onchain Execution" makes this non-negotiable:

```
1. KeeperHub API connection working (org API key, /api/chains call succeeds)
2. One real Sepolia transaction executed through Direct Execution API — simulate → broadcast → confirmed
3. Basic single agent that decides "approve/reject"
4. Policy engine (spending limit, confidence threshold)
5. Multi-agent analysis (Analyst, Security, Risk)
6. Decision/consensus engine
7. Audit trail (persisted, queryable)
8. Dashboard UI (Stitch-generated, then wired to real data)
9. Failure handling (retry, revert handling, idempotency)
10. Demo polish + video
```

Do not start the dashboard until step 2 is proven end-to-end with a real tx hash on Sepolia Etherscan. A polished UI with no real transaction fails the hackathon's hard submission requirement.

---

## 1. KeeperHub Integration — Exact Spec

This is grounded directly in KeeperHub's current docs (`docs.keeperhub.com`), not assumed.

### 1.1 Auth

Organization API key, `kh_` prefix, created at app.keeperhub.com → Settings → API Keys → Organization tab. Passed as:

```
Authorization: Bearer kh_your_api_key
```

Store as `KEEPERHUB_API_KEY` in `.env.local`, never in client code.

### 1.2 The Safe First-Write Sequence (mandatory pattern — this IS the reliability story)

This sequence is documented by KeeperHub itself and maps almost exactly onto the brief's "Reliability and Observability" judging criterion. Use it verbatim as your execution pipeline:

```
1. GET /api/chains → pick a chain where isEnabled && isTestnet are both true
   (confirm 11155111 / Sepolia qualifies before hardcoding it)

2. POST /api/execute/transfer (or /contract-call, or /check-and-execute)
   with "simulate": true (strict boolean, not string "true")
   → proceed only if response has success: true AND wouldRevert: false

3. Remove "simulate", add a unique Idempotency-Key header (UUID),
   send the identical request body once

4. Save the returned executionId
   Poll GET /api/execute/{executionId}/status
   Honor the X-Poll-Interval-Hint response header between polls
   (0 = terminal state, stop polling)

5. Treat status response's transactionHash + transactionLink
   as the authoritative onchain proof — this is what goes in the
   audit record and the hackathon submission
```

Important corrections vs. generic assumptions:
- Execution is **synchronous** — `POST /api/execute/transfer` returns `202` with `status: "completed"` or `"failed"` already resolved in most cases. The `executionId` + polling path exists for tracking, not because it's async by default.
- `simulate: true` does **not** write an audit row, does **not** reserve spending cap, and produces **no** transaction hash. Don't try to log simulations as executions in your own audit trail — keep simulate vs. broadcast as clearly distinct events.
- Rate limit: 60 req/min per API key. Fine for a demo, but don't hammer polling on a sub-second timer — honor `X-Poll-Interval-Hint`.
- Spending caps are configured org-side in wei; exceeding returns `403` with `"Daily spending cap exceeded"`. Worth demoing this as one of your reliability/failure-handling moments (see §9).

### 1.3 Relevant endpoint for the MVP action

```
POST /api/execute/transfer
{
  "chainId": 11155111,
  "recipientAddress": "0x...",
  "amount": "0.001",
  "simulate": true
}
```

No `tokenAddress` needed for a native ETH transfer (simplest possible real transaction for the MVP — a testnet ETH transfer standing in for "treasury payment"). Swap to a token transfer or `contract-call` only if time allows in Phase 2.

### 1.4 Idempotency

Every broadcast call must carry a unique `Idempotency-Key` (UUID). This is a real reliability feature to demo, not boilerplate — show what happens if the same key is retried (replay, not double-spend). Good material for the "Reliability and Observability" score and for a Security Agent demo beat.

### 1.5 Execution status polling

```
GET /api/execute/{executionId}/status
```
Returns `transactionHash`, `transactionLink`, `gasUsedWei`, `status` (`pending` / `running` / `completed` / `failed`). This response is what populates the Execution Details page (§7) — don't invent fields, use exactly this shape.

### 1.6 Pricing (confirmed — no billing setup needed)

Free tier: 5,000 executions/mo, $1/mo gas credits, permanent, no credit card required. Every operation (simulate, broadcast, status poll) counts as one execution against this quota. All EVM chains including Sepolia are available on the free tier. This comfortably covers hackathon build + demo volume — do not upgrade tiers for this project.

### 1.7 What NOT to build

Do not build a KeeperHub *workflow* (nodes/edges/triggers) for the MVP — that's a heavier abstraction meant for no-code automation and isn't necessary to prove onchain execution. The Direct Execution API is the correct, minimal-surface-area path for a hackathon timeline. Revisit `create_workflow`/MCP workflow tools only as a Phase 2 stretch if there's time (e.g., a scheduled trigger).

---

## 2. Agent Architecture

```
Trigger (manual button in MVP; scheduled/webhook = Phase 2)
   ↓
Orchestrator (Next.js route handler, not a separate framework —
   see note below)
   ↓
   ├─ Analyst Agent   → structured JSON: {decision, confidence, reasons[]}
   ├─ Security Agent  → structured JSON: {decision, confidence, risk, reasons[]}
   └─ Risk Agent      → structured JSON: {decision, confidence, risk, reasons[]}
   ↓
Decision Engine (deterministic TS function, NOT an LLM call)
   → consensus count, policy checks, final EXECUTE/REJECT
   ↓
KeeperHub Direct Execution API (§1.2 sequence)
   ↓
Audit Record (Postgres) — trigger, all 3 agent outputs, policy checks,
   KeeperHub response fields, tx hash, timestamp
```

**Agent framework decision:** Skip a heavyweight framework (LangChain/CrewAI/ElizaOS) for the MVP. Three parallel calls to an LLM API with a strict JSON-mode system prompt per agent, orchestrated by a single Next.js API route, is faster to build, easier to debug under time pressure, and just as demoable — the brief lists frameworks as optional ("any agent framework or custom architecture"). A custom architecture is explicitly fine and reduces integration risk this close to deadline.

**Decision Engine must be deterministic code, not a 4th LLM call.** Judges are specifically scoring "Reliability" — a hardcoded consensus function (`approvals >= requiredApprovals && allPolicyChecksPassed`) is more defensible and more demoable than "an AI decided if the AIs were right."

### 2.1 Agent prompt shape (all three agents)

Each agent gets the same trigger context, different system prompt, and must return **only** JSON matching this schema — no prose:

```json
{
  "decision": "approve" | "reject",
  "confidence": 0.0-1.0,
  "risk": "low" | "medium" | "high",
  "reasons": ["short_snake_case_reason", "..."]
}
```

Reasons should be short structured tags (as in the brief's examples — `payment_matches_schedule`, `recipient_is_approved`), not full sentences. This keeps the audit trail scannable and avoids the agents free-styling explanations that are hard to render consistently in the UI.

---

## 3. Policy Engine

Single hardcoded policy object for the MVP (configurable via UI is Phase 2):

```ts
{
  maxTransactionUsd: 50,        // convert to Sepolia testnet ETH equivalent for demo
  minConfidence: 0.85,
  requiredApprovals: 2,         // out of 3 agents
  allowedActions: ["transfer"],
  allowedChainId: 11155111
}
```

Policy checks run **after** consensus, **before** the KeeperHub call. Both consensus and policy must pass for `EXECUTE`.

---

## 4. Database Schema (Postgres, minimal)

```sql
executions (
  id, trigger_description, decision, -- 'execute' | 'reject'
  analyst_json, security_json, risk_json,   -- raw agent outputs
  consensus_count, policy_checks_json,
  keeperhub_execution_id, transaction_hash, transaction_link,
  gas_used_wei, status, error,
  created_at, completed_at
)

policies (
  id, max_transaction_usd, min_confidence,
  required_approvals, allowed_actions, allowed_chain_id
)
```

Skip `users` / `wallets` tables for MVP — single demo wallet, single demo policy is enough. Don't overbuild.

---

## 4.5 Landing Page (`/` — marketing, unauthenticated)

The dashboard moves to `/dashboard` (or behind a "Launch App" action); `/` becomes a pitch page. This isn't required by the hackathon's submission rules (repo + demo video + real tx link only), but it directly strengthens two things judges score: the "believable what happens after the hackathon" story (Part 3, Win Condition 4 in the patterns doc) and general polish/first-impression if anyone clicks through from the repo.

**Structure:**
```
Hero
  Headline: the one-line pitch — "AI decides. Agents verify.
  KeeperHub executes."
  Subhead: one sentence expanding the value (multi-agent
  reliability layer for autonomous onchain operations)
  CTA: "Launch Dashboard" → /dashboard
  Secondary: link to GitHub repo (@abrahamebij)

How it works
  Visualize Observe → Analyse → Verify → Decide → Execute → Audit
  as a horizontal flow — this is the core mental model and should
  be the most memorable visual on the page

Why it's reliable
  3 short cards: Consensus (multiple agents must agree), Policy
  (deterministic limits, not AI judgment), Audit (every execution
  is provable onchain)

Built on KeeperHub
  Brief mention that execution runs through KeeperHub's
  simulate-then-broadcast pipeline — ties the sponsor tech in
  visibly, which the brief's judging criteria explicitly reward

Footer
  GitHub link, built-for-hackathon note
```

Keep this to one scroll, not a multi-section SaaS site — it's a pitch, not a product marketing funnel. The dashboard is the substance; this page is 20 seconds of context before someone gets there.

**Stitch prompt (landing page):**

```text
Design a single-scroll pitch/landing page for "AgentOps," a
multi-agent AI system that verifies and executes blockchain
transactions through an execution infrastructure layer called
KeeperHub. Include the "AgentOps" wordmark in the top-left of a
minimal transparent navbar — clean geometric sans-serif, matching
the wordmark style already established for the AgentOps dashboard
(no icon needed, or a minimal abstract mark only).

Purpose: Convince a technical evaluator (hackathon judge or
developer) in under 30 seconds of scrolling that this is a real,
reliable system worth trying — not a toy demo. Drive them to a
"Launch Dashboard" call to action.

Audience: Hackathon judges and developers, technically literate,
skeptical of AI hype, evaluating during a time-constrained review.

Brand personality: Precise, trustworthy, technical, calm,
editorial — same personality as the dashboard. Reference design
languages: Vercel + Linear. Dark mode by default, matching the
dashboard's palette (near-black, cool gray, single accent color).

Visual language: Large, confident editorial typography for the
headline. Generous whitespace. A horizontal step-diagram for the
"Observe -> Analyse -> Verify -> Decide -> Execute -> Audit" flow
as the page's central visual — treat it as an architecture diagram,
not decorative icons. Subtle micro-interactions on scroll only,
nothing flashy.

Sections, top to bottom:
1. Hero: headline "AI decides. Agents verify. KeeperHub executes."
   subheadline explaining it's a multi-agent reliability layer for
   autonomous onchain operations, a primary "Launch Dashboard"
   button, a secondary GitHub link
2. A horizontal flow diagram showing six connected stages: Observe,
   Analyse, Verify, Decide, Execute, Audit
3. Three small cards explaining reliability: Consensus (multiple
   independent agents must agree), Policy (deterministic limits
   enforced in code, not left to AI judgment), Audit (every
   execution produces a provable onchain record)
4. A brief section acknowledging the execution infrastructure
   partner (KeeperHub) — mention that transactions are simulated
   before they're ever broadcast, and that every action is
   verifiable onchain
5. Simple footer with GitHub link

Typography: Same technical hierarchy as the dashboard — clean
grotesque sans for headings, a monospace or semi-condensed sans
accent for technical labels in the flow diagram.

Avoid: generic purple-to-blue gradients, glassmorphism, stock 3D
blobs, glowing AI/brain/neural-network imagery, a busy multi-section
SaaS marketing site with pricing tables and testimonials — this is
a single confident scroll, not a product marketing funnel.

Prioritize a strong first impression in the initial viewport
(above the fold should already communicate what this is and why
it's trustworthy) and a clear, single call to action.
```

---

## 5. Frontend — Stitch First

Per your standing rule: Stitch generates the initial UI shell, then Gemini wires it to real data and the KeeperHub-backed API routes. There are two separate Stitch prompts — one for the landing page (§4.5) and one for the dashboard/execution detail (§8) — generate them as separate Stitch runs so each gets full attention, then keep them visually consistent (same palette, same wordmark, same type system). Design constraints to hold Stitch to (from the AI-slop-prevention doc):

**Guardrails to include in the Stitch prompt:**
- No generic purple gradients, no default glassmorphism-everywhere, no stock 3D blobs
- No centered-everything SaaS template layout
- Reference design languages: Vercel + Linear (dark, technical, data-dense but calm — fits an "operations" product)

**Pages (adapted from the brief's §13 — landing page added at root):**
```
/               Landing page (marketing/pitch, unauthenticated — see §4.5)
/dashboard      Dashboard
/agents         Agent status/config
/policies       Policy editor
/executions     Execution list
/execution/[id] Execution detail (see §7 — this is the strongest demo page)
/settings       Wallet + KeeperHub key config
```

For the MVP, `/agents` and `/settings` can be minimal/static — the dashboard and execution detail page are what carry the demo and the UX judging criteria.

---

## 6. Dashboard (`/`)

Must communicate system state at a glance — this is standard "operations dashboard" UX, not novel, but needs to be clean:

```
AgentOps
SYSTEM STATUS: ● Monitoring
ACTIVE POLICIES: 1
EXECUTIONS: [count]
SUCCESS RATE: [%]
PENDING ACTIONS: [count]

Recent Executions:
✓ Transfer · 0.001 ETH · 2 min ago
✓ Transfer · 0.001 ETH · 18 min ago
✗ Transaction failed · Retry scheduled · 1h ago
```

Real data from the `executions` table — no mock numbers once wired.

---

## 7. Execution Detail Page — This Is the Demo's Centerpiece

This page directly proves the "Reliability and Observability" and "Use of KeeperHub" judging criteria in one screen. Structure, using **real** KeeperHub response fields (not invented ones):

```
Execution #[id]

Trigger: [trigger_description]
Decision: EXECUTE / REJECT

Agent Consensus
  Analyst    [confidence]%  [✓/✗]   reasons: [tags]
  Security   [confidence]%  [✓/✗]   reasons: [tags]
  Risk       [confidence]%  [✓/✗]   reasons: [tags]

Policy Checks
  ✓/✗ Amount within limit
  ✓/✗ Confidence threshold met
  ✓/✗ Chain allowed

KeeperHub Execution
  ✓ Simulated — wouldRevert: false, gasEstimate: [n]
  ✓ Broadcast — Idempotency-Key: [uuid]
  Status: [status from polling]

Transaction
  [transactionHash]
  [View on Etherscan → transactionLink]
```

This is the single screen to walk through slowly in the demo video.

---

## 8. Stitch Prompt

```text
Design a premium operations dashboard web app called "AgentOps" for
technical users who manage autonomous AI agents that execute blockchain
transactions. Include a simple wordmark-style logo treatment for
"AgentOps" in the top-left of the navbar — clean geometric sans-serif,
no icon needed unless it's a minimal abstract mark (avoid generic
robot/circuit-board iconography).

Purpose: A dashboard where users monitor AI agents that analyse
blockchain events, reach consensus, and execute verified transactions
through an execution infrastructure layer (KeeperHub). Users need to
trust this system, so the design should feel precise, technical, and
calm — not playful or consumer-facing.

Audience: Developers and technical operators evaluating an autonomous
transaction system during a hackathon demo. They need to scan system
state instantly and drill into a single execution's full audit trail.

Brand personality: Precise, trustworthy, technical, calm, editorial.
Reference design languages: Vercel + Linear. Dark mode by default.

Visual language: Generous whitespace, monospace accents for
transaction hashes and technical values, clear data hierarchy,
subtle status colors (green for approved/success, amber for pending,
red for rejected/failed) used sparingly against a mostly neutral
dark palette (near-black, cool gray, single accent color — electric
blue or similar).

Include these screens:
1. Dashboard — system status, active policy count, execution count,
   success rate, pending actions, recent executions list with
   status icons
2. Execution detail page — a vertical structured record showing:
   trigger description, three agent cards (Analyst, Security, Risk)
   each with a confidence percentage and short reason tags, a policy
   checks list, a KeeperHub execution section showing simulation and
   broadcast steps as a checklist, and a final transaction hash with
   a link-out button

Typography: Clear technical hierarchy — a distinct monospace or
semi-condensed sans for data/hashes/numbers, a clean grotesque sans
for headings and labels.

Layout: Sidebar navigation (Dashboard, Agents, Policies, Executions,
Settings), main content area using a card-based grid for the
dashboard and a single-column structured record for execution detail.

Motion: Subtle status transitions only — no decorative animation.

Avoid: generic purple-to-blue gradients, glassmorphism on every
surface, stock 3D blobs or abstract AI/circuit imagery, centered
SaaS-template hero sections, excessive rounded corners, generic
"AI slop" iconography (glowing brains, neural network line art).

Prioritize accessibility, information density appropriate for
technical users, and a production-ready, audit-tool feel — this
should look closer to a blockchain explorer or observability
dashboard than a marketing site.
```

---

## 9. Reliability Features to Actually Demo (not just build)

Per the brief's §19 and KeeperHub's own emphasis on reliability, pick at minimum:

1. **Simulate-before-broadcast** — show a transaction caught by `wouldRevert: true` before it ever reaches the chain (e.g., deliberately misconfigure a test case). This is a genuinely strong demo beat because it's real KeeperHub behavior, not staged.
2. **Idempotency replay** — fire the same `Idempotency-Key` twice, show the second call returns the original response instead of double-executing.
3. **Confidence threshold rejection** — one agent returns low confidence, show the policy engine reject before KeeperHub is ever called.
4. **Spending cap enforcement** (if time allows) — configure a low daily cap org-side, show the `403 Daily spending cap exceeded` path handled gracefully in the UI rather than as a raw error.

Any 2 of these 4 is enough for a strong "Reliability and Observability" score — don't try to build all four under time pressure.

---

## 10. Demo Video Structure (2–3 min, per brief §18)

1. Policy config shown (5s)
2. Trigger fired manually (5s)
3. Three agents analyzing, consensus shown (15–20s)
4. Decision Engine: EXECUTE (5s)
5. KeeperHub: simulate ✓ → broadcast ✓ → confirmation ✓ (15s)
6. Real transaction hash shown, click through to Sepolia Etherscan (10s)
7. Execution detail page — full audit record scroll-through (20s)
8. One reliability moment from §9 (15s)
9. Close on the one-line pitch

Per your standard format: Flow AI intro clips (2×8s) precede the screen recording. No background music or on-screen text baked into the Flow clips — screen recording carries the technical proof.

---

## 11. What NOT to Build (repeating the brief's own list — worth restating given deadline pressure)

No general-purpose assistant, no full DeFi protocol, no custom wallet infra, no multi-chain support, no 20 agents, no human-approval flow, no x402/agentic payments, no workflow builder UI. Three agents, one policy, one action type, one chain, one real transaction. Everything else is Phase 2 only if the MVP is done early.
