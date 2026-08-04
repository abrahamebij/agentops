"use client";

import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";

export function AgentsComponent() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-24 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full max-w-container-max mx-auto px-4">
            {/* Page Header */}
            <div className="flex flex-col gap-2 mb-12 relative z-10 pt-4">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                System Agents
              </h1>
              <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
                Autonomous models monitoring and verifying every onchain execution.
              </p>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-12">
              {/* Agent 1: Analyst Model */}
              <div className="flex flex-col bg-surface-container-low rounded-xl shadow-lg relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-outline-variant/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Analyst Model
                      </h2>
                      <span className="font-mono-data text-mono-data text-outline">
                        v4.2.1-epsilon
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded shadow-sm border border-outline-variant/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-caps text-label-caps text-on-surface">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-8 flex-grow">
                    Validates trigger data against expected parameters and historical benchmarks.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        APPROVAL RATE
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-data text-mono-data text-primary">
                          94.2%
                        </span>
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            className="opacity-20"
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                          />
                          <path
                            d="M12 22c5.523 0 10-4.477 10-10"
                            strokeDasharray="100"
                            strokeDashoffset="6"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        LATENCY
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        89ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        EXECUTIONS
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        1,240
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent 2: Security Model */}
              <div className="flex flex-col bg-surface-container-low rounded-xl shadow-lg relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-outline-variant/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Security Model
                      </h2>
                      <span className="font-mono-data text-mono-data text-outline">
                        v2.9.0-delta
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded shadow-sm border border-outline-variant/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-caps text-label-caps text-on-surface">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-8 flex-grow">
                    Screens recipient addresses and target contracts for known vulnerabilities or exploits.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        APPROVAL RATE
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-data text-mono-data text-primary">
                          99.9%
                        </span>
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            className="opacity-20"
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                          />
                          <path
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2"
                            strokeDasharray="100"
                            strokeDashoffset="0"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        LATENCY
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        142ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        EXECUTIONS
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        1,240
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent 3: Risk Model */}
              <div className="flex flex-col bg-surface-container-low rounded-xl shadow-lg relative overflow-hidden group transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-outline-variant/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Risk Model
                      </h2>
                      <span className="font-mono-data text-mono-data text-outline">
                        v3.1.5-gamma
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded shadow-sm border border-outline-variant/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      <span className="font-label-caps text-label-caps text-on-surface">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-8 flex-grow">
                    Enforces spending limits, frequency thresholds, and slippage tolerance.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        APPROVAL RATE
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-data text-mono-data text-primary">
                          88.5%
                        </span>
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            className="opacity-20"
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                          />
                          <path
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 2 12"
                            strokeDasharray="100"
                            strokeDashoffset="12"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        LATENCY
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        64ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-surface-container rounded p-3 shadow-sm border border-outline-variant/20">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">
                        EXECUTIONS
                      </span>
                      <span className="font-mono-data text-mono-data text-on-surface">
                        1,240
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consensus Rule Bar */}
            <div className="w-full bg-surface-container-high rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden border border-outline-variant/30">
              <div className="absolute top-0 left-0 h-1 w-full bg-surface-container-lowest">
                <div className="h-full bg-primary w-2/3 shadow-[0_0_10px_rgba(174,198,255,0.5)]"></div>
              </div>
              <div className="flex items-center gap-4 z-10">
                <div className="w-10 h-10 rounded bg-surface flex items-center justify-center shadow-sm border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary">
                    account_tree
                  </span>
                </div>
                <span className="font-mono-data text-mono-data text-on-surface">
                  Consensus Rule: 2 of 3 agents must approve to execute.
                </span>
              </div>
              <div className="flex items-center gap-3 z-10 bg-surface-container-lowest px-4 py-2 rounded-lg shadow-sm border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-caps text-label-caps text-primary tracking-widest">
                  THRESHOLD: 85%
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
