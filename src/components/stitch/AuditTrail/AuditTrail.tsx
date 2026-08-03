"use client";

import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";

export function AuditTrail() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-16 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full max-w-container-max mx-auto px-8 gap-y-12 pb-16">
            {/* Title section */}
            <div className="flex flex-col relative w-full pt-8">
              <div className="absolute -left-12 top-10 w-[1px] h-[calc(100%-1rem)] bg-gradient-to-b from-primary via-primary/30 to-transparent"></div>
              <div className="absolute -left-[3.25rem] top-10 w-3 h-3 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(174,198,255,0.8)]"></div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                  Execution T-84920
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-mono-data text-[10px] tracking-wide uppercase">
                  Finalized
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-background mb-3">
                Liquidity Rebalance Event
              </h1>
              <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
                Triggered by sub-optimal pool utilization in primary vault. Orchestrated across three autonomous agent models before deterministic constraint validation.
              </p>
            </div>

            {/* Agent Consensus Section */}
            <div className="flex flex-col relative w-full">
              <div className="absolute -left-12 top-0 w-[1px] h-full bg-gradient-to-b from-primary/30 via-secondary-container to-secondary-container/20"></div>
              <h2 className="font-headline-md text-headline-md text-on-background mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-outline-variant">
                  psychology
                </span>
                Agent Consensus
              </h2>
              <div className="flex flex-col gap-6">
                {/* Agent 1 */}
                <div className="flex flex-col p-6 rounded-lg bg-surface-container shadow-md relative overflow-hidden group border border-outline-variant/30">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[64px] text-on-surface">
                      query_stats
                    </span>
                  </div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-lg">
                          monitoring
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-body-base font-semibold text-on-surface">
                          Analyst Model
                        </h3>
                        <p className="font-mono-data text-label-caps text-on-surface-variant">
                          v4.2.1-epsilon
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono-data text-headline-md text-primary">
                        94.2%
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Confidence
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded text-on-surface font-mono-data text-mono-data shadow-inner mb-4 relative z-10 border border-outline-variant/20">
                    <span className="text-primary-fixed-dim">&gt;</span> Detected APY divergence of 1.4% vs benchmark.<br />
                    <span className="text-primary-fixed-dim">&gt;</span> Simulating reallocation impact...<br />
                    <span className="text-on-surface-variant">&gt; Yield improvement delta: +0.84% net of gas fees. Recommendation: PROCEED.</span>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="px-2 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                      #YIELD_OPT
                    </span>
                    <span className="px-2 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                      #GAS_ESTIMATE
                    </span>
                  </div>
                </div>

                {/* Agent 2 */}
                <div className="flex flex-col p-6 rounded-lg bg-surface-container shadow-md relative overflow-hidden group border border-outline-variant/30">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[64px] text-on-surface">
                      gpp_good
                    </span>
                  </div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-lg">
                          shield_locked
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-body-base font-semibold text-on-surface">
                          Security Validator
                        </h3>
                        <p className="font-mono-data text-label-caps text-on-surface-variant">
                          v2.9.0-delta
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono-data text-headline-md text-primary">
                        99.9%
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Confidence
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded text-on-surface font-mono-data text-mono-data shadow-inner mb-4 relative z-10 border border-outline-variant/20">
                    <span className="text-primary-fixed-dim">&gt;</span> Scanning target contracts for reentrancy vectors.<br />
                    <span className="text-primary-fixed-dim">&gt;</span> Verifying slippage tolerance bounds (max 0.5%).<br />
                    <span className="text-on-surface-variant">&gt; No anomalies detected in calldata payload. Recommendation: SAFE.</span>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="px-2 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                      #CALLDATA_SCAN
                    </span>
                    <span className="px-2 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                      #SLIPPAGE_CHECK
                    </span>
                  </div>
                </div>

                {/* Agent 3 */}
                <div className="flex flex-col p-6 rounded-lg bg-surface-container shadow-md relative overflow-hidden group border border-outline-variant/30">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[64px] text-on-surface">
                      balance
                    </span>
                  </div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-lg">
                          warning
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-body-base font-semibold text-on-surface">
                          Risk Assessor
                        </h3>
                        <p className="font-mono-data text-label-caps text-on-surface-variant">
                          v3.1.5-gamma
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono-data text-headline-md text-primary">
                        88.5%
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Confidence
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface p-4 rounded text-on-surface font-mono-data text-mono-data shadow-inner mb-4 relative z-10 border border-outline-variant/20">
                    <span className="text-primary-fixed-dim">&gt;</span> Evaluating historical volatility of destination pool.<br />
                    <span className="text-primary-fixed-dim">&gt;</span> Checking global exposure limits (current: 42%).<br />
                    <span className="text-on-surface-variant">&gt; Exposure remains within acceptable threshold. Recommendation: PROCEED.</span>
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <span className="px-2 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                      #VOLATILITY_IDX
                    </span>
                    <span className="px-2 py-1 rounded-sm bg-surface-variant text-on-surface-variant font-label-caps text-[10px]">
                      #EXPOSURE_CAP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Validation */}
            <div className="flex flex-col relative w-full">
              <div className="absolute -left-12 top-0 w-[1px] h-full bg-gradient-to-b from-secondary-container/20 via-outline-variant to-outline-variant/10"></div>
              <h2 className="font-headline-md text-headline-md text-on-background mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-outline-variant">
                  rule
                </span>
                Deterministic Policy Validation
              </h2>
              <div className="bg-surface-container rounded-lg p-2 shadow-md border border-outline-variant/30">
                <ul className="flex flex-col">
                  <li className="flex items-center justify-between p-4 border-b border-surface-variant/50 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">
                        check_circle
                      </span>
                      <span className="font-body-base text-body-base text-on-surface">
                        Maximum Transaction Size Limit
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono-data text-mono-data text-on-surface-variant">
                        &lt; 500 ETH
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase bg-primary/10 text-primary">
                        Passed
                      </span>
                    </div>
                  </li>
                  <li className="flex items-center justify-between p-4 border-b border-surface-variant/50 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">
                        check_circle
                      </span>
                      <span className="font-body-base text-body-base text-on-surface">
                        Gas Price Ceiling Check
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono-data text-mono-data text-on-surface-variant">
                        &lt; 150 Gwei
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase bg-primary/10 text-primary">
                        Passed
                      </span>
                    </div>
                  </li>
                  <li className="flex items-center justify-between p-4 border-b border-surface-variant/50 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">
                        check_circle
                      </span>
                      <span className="font-body-base text-body-base text-on-surface">
                        Authorized Target Contract Allowlist
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono-data text-mono-data text-on-surface-variant">
                        0x...8f9e
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase bg-primary/10 text-primary">
                        Passed
                      </span>
                    </div>
                  </li>
                  <li className="flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">
                        check_circle
                      </span>
                      <span className="font-body-base text-body-base text-on-surface">
                        Execution Time Window Valid
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono-data text-mono-data text-on-surface-variant">
                        14:00 - 16:00 UTC
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-label-caps uppercase bg-primary/10 text-primary">
                        Passed
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* KeeperHub Execution */}
            <div className="flex flex-col relative w-full">
              <div className="absolute -left-12 top-0 w-[1px] h-full bg-gradient-to-b from-outline-variant/10 via-surface-variant to-transparent"></div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline-variant">
                    hub
                  </span>
                  KeeperHub Execution
                </h2>
                <div className="flex gap-4">
                  <span className="font-mono-data text-[12px] text-on-surface-variant bg-surface-container px-3 py-1 rounded shadow-sm border border-outline-variant/30">
                    Nonce: 4892
                  </span>
                  <span className="font-mono-data text-[12px] text-on-surface-variant bg-surface-container px-3 py-1 rounded shadow-sm border border-outline-variant/30">
                    Gas Used: 215,409
                  </span>
                </div>
              </div>
              <div className="flex flex-col bg-surface-container rounded-lg p-8 shadow-md border border-outline-variant/30">
                <div className="flex flex-col gap-8 relative">
                  <div className="absolute left-3 top-4 bottom-4 w-[1px] bg-surface-variant"></div>
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-on-primary">
                        check
                      </span>
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline-md text-body-base font-semibold text-on-surface">
                          Dry Run Simulation
                        </span>
                        <span className="font-mono-data text-label-caps text-on-surface-variant">
                          14:32:01 UTC
                        </span>
                      </div>
                      <p className="font-body-base text-body-base text-on-surface-variant mb-2">
                        Forked mainnet simulation successful. State transitions matched agent consensus expectations.
                      </p>
                      <div className="bg-surface p-3 rounded font-mono-data text-[11px] text-on-surface opacity-70 border border-outline-variant/20">
                        [sim] State diff OK. Emitted 2 events. Output amount: 45.2 WETH.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-on-primary">
                        check
                      </span>
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline-md text-body-base font-semibold text-on-surface">
                          Mempool Broadcast
                        </span>
                        <span className="font-mono-data text-label-caps text-on-surface-variant">
                          14:32:04 UTC
                        </span>
                      </div>
                      <p className="font-body-base text-body-base text-on-surface-variant">
                        Transaction signed via KMS enclave and broadcast to private RPC endpoint.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(174,198,255,0.4)]">
                      <span className="material-symbols-outlined text-[14px] text-on-primary">
                        done_all
                      </span>
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline-md text-body-base font-semibold text-on-surface">
                          On-Chain Confirmation
                        </span>
                        <span className="font-mono-data text-label-caps text-on-surface-variant">
                          14:32:16 UTC
                        </span>
                      </div>
                      <p className="font-body-base text-body-base text-on-surface-variant mb-4">
                        Included in block 18492041. Finality threshold reached.
                      </p>
                      <div className="flex items-center justify-between bg-surface p-4 rounded shadow-inner border border-outline-variant/20">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-outline-variant">
                            tag
                          </span>
                          <span className="font-mono-data text-mono-data text-on-surface truncate max-w-[200px] sm:max-w-md">
                            0x8a7b9c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
                          </span>
                        </div>
                        <a
                          href="https://etherscan.io"
                          target="_blank"
                          rel="noreferrer"
                          className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded font-label-caps text-label-caps transition-colors flex items-center gap-2 shrink-0"
                        >
                          EXPLORER
                          <span className="material-symbols-outlined text-[14px]">
                            open_in_new
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
