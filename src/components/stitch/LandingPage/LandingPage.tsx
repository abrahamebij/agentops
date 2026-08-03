"use client";

import Link from "next/link";
import { PublicHeader } from "../PublicHeader";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <PublicHeader />
      <main className="pt-16 min-h-screen flex-1">
        <div className="flex flex-col w-full">
          {/* Hero Section */}
          <section className="min-h-[870px] flex flex-col justify-center max-w-container-max mx-auto px-margin-page w-full relative pt-12 pb-24">
            <div className="flex flex-col gap-8 max-w-4xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full w-fit border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-mono-data text-mono-data text-on-surface-variant">
                  System Status: Active
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-background tracking-tight">
                <span className="text-on-surface-variant">AI decides.</span>
                <br />
                <span>Agents verify.</span>
                <br />
                <span className="text-primary relative inline-block">
                  KeeperHub executes.
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-primary/30"></span>
                </span>
              </h1>
              <p className="font-headline-md text-headline-md text-on-surface-variant max-w-2xl leading-snug">
                A multi-agent reliability layer for autonomous onchain operations.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Link
                  href="/dashboard"
                  className="bg-primary hover:bg-primary-container text-on-primary px-8 py-4 font-label-caps text-label-caps rounded-sm transition-colors relative group overflow-hidden inline-flex items-center gap-2"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    LAUNCH DASHBOARD
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </span>
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-caps text-label-caps rounded-sm transition-colors flex items-center gap-2 border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px]">code</span>
                  GITHUB
                </a>
              </div>
            </div>
            {/* Background decorative grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 flex items-center justify-end overflow-hidden">
              <svg
                className="w-1/2 h-full text-outline-variant stroke-current"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M 10 0 L 0 0 0 10" fill="none" strokeWidth="0.5" />
                </pattern>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>
          </section>

          {/* Architecture Flow Diagram */}
          <section className="bg-surface-container-low py-32 relative overflow-hidden border-t border-b border-outline-variant/30">
            <div className="max-w-container-max mx-auto px-margin-page relative z-10">
              <div className="mb-16 flex justify-between items-end border-b border-outline-variant/30 pb-4">
                <div>
                  <h2 className="font-label-caps text-label-caps text-primary mb-2">
                    SYSTEM ARCHITECTURE
                  </h2>
                  <p className="font-headline-md text-headline-md text-on-background">
                    Operation Pipeline
                  </p>
                </div>
                <div className="font-mono-data text-mono-data text-on-surface-variant text-right">
                  LATENCY: &lt;50MS
                  <br />
                  NODES: 6 ACTIVE
                </div>
              </div>
              {/* The Flow */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/50 -translate-y-1/2 z-0"></div>
                {/* Stages */}
                <div className="w-full lg:w-auto flex flex-col gap-2 p-4 bg-surface rounded-sm border border-outline-variant/30 relative z-10 min-w-[140px]">
                  <span className="font-mono-data text-[10px] text-on-surface-variant uppercase tracking-widest">
                    01
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface">
                    Observe
                  </span>
                </div>
                <div className="w-[1px] h-8 lg:w-8 lg:h-[1px] bg-outline-variant/50 relative z-10 lg:hidden"></div>
                <div className="w-full lg:w-auto flex flex-col gap-2 p-4 bg-surface rounded-sm border border-outline-variant/30 relative z-10 min-w-[140px]">
                  <span className="font-mono-data text-[10px] text-on-surface-variant uppercase tracking-widest">
                    02
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface">
                    Analyse
                  </span>
                </div>
                <div className="w-[1px] h-8 lg:w-8 lg:h-[1px] bg-outline-variant/50 relative z-10 lg:hidden"></div>
                <div className="w-full lg:w-auto flex flex-col gap-2 p-4 bg-surface rounded-sm border border-outline-variant/30 relative z-10 min-w-[140px] shadow-[0_0_20px_rgba(0,112,243,0.1)] border-primary/50">
                  <span className="font-mono-data text-[10px] text-primary uppercase tracking-widest">
                    03
                  </span>
                  <span className="font-label-caps text-label-caps text-primary">
                    Verify
                  </span>
                </div>
                <div className="w-[1px] h-8 lg:w-8 lg:h-[1px] bg-outline-variant/50 relative z-10 lg:hidden"></div>
                <div className="w-full lg:w-auto flex flex-col gap-2 p-4 bg-surface rounded-sm border border-outline-variant/30 relative z-10 min-w-[140px]">
                  <span className="font-mono-data text-[10px] text-on-surface-variant uppercase tracking-widest">
                    04
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface">
                    Decide
                  </span>
                </div>
                <div className="w-[1px] h-8 lg:w-8 lg:h-[1px] bg-outline-variant/50 relative z-10 lg:hidden"></div>
                <div className="w-full lg:w-auto flex flex-col gap-2 p-4 bg-surface rounded-sm border border-outline-variant/30 relative z-10 min-w-[140px] shadow-[0_0_20px_rgba(202,78,0,0.1)] border-tertiary-container/50">
                  <span className="font-mono-data text-[10px] text-tertiary-container uppercase tracking-widest">
                    05
                  </span>
                  <span className="font-label-caps text-label-caps text-tertiary-container">
                    Execute
                  </span>
                </div>
                <div className="w-[1px] h-8 lg:w-8 lg:h-[1px] bg-outline-variant/50 relative z-10 lg:hidden"></div>
                <div className="w-full lg:w-auto flex flex-col gap-2 p-4 bg-surface rounded-sm border border-outline-variant/30 relative z-10 min-w-[140px]">
                  <span className="font-mono-data text-[10px] text-on-surface-variant uppercase tracking-widest">
                    06
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface">
                    Audit
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Reliability Cards */}
          <section className="py-32">
            <div className="max-w-container-max mx-auto px-margin-page">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {/* Card 1 */}
                <div className="bg-surface-container rounded-sm p-8 border border-outline-variant/30 hover:bg-surface-container-high transition-colors group">
                  <div className="font-mono-data text-[10px] text-outline mb-6 group-hover:text-primary transition-colors">
                    MOD_01
                  </div>
                  <h3 className="font-label-caps text-label-caps text-on-background mb-4">
                    CONSENSUS
                  </h3>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-6">
                    Multi-agent voting mechanism requiring supermajority agreement
                    before transaction framing. Prevents single-point decision
                    failures in high-value operations.
                  </p>
                  <div className="h-[60px] w-full border-t border-b border-outline-variant/30 flex items-center justify-between">
                    <span className="font-mono-data text-mono-data text-on-surface-variant">
                      THRES
                    </span>
                    <span className="font-mono-data text-mono-data text-primary">
                      2/3 SIG
                    </span>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="bg-surface-container rounded-sm p-8 border border-outline-variant/30 hover:bg-surface-container-high transition-colors group">
                  <div className="font-mono-data text-[10px] text-outline mb-6 group-hover:text-primary transition-colors">
                    MOD_02
                  </div>
                  <h3 className="font-label-caps text-label-caps text-on-background mb-4">
                    POLICY
                  </h3>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-6">
                    Strict adherence to pre-defined smart contract limits. Agents
                    simulate execution against shadow states to guarantee invariant
                    preservation.
                  </p>
                  <div className="h-[60px] w-full border-t border-b border-outline-variant/30 flex items-center justify-between">
                    <span className="font-mono-data text-mono-data text-on-surface-variant">
                      CHECK
                    </span>
                    <span className="font-mono-data text-mono-data text-primary">
                      INVARIANT
                    </span>
                  </div>
                </div>
                {/* Card 3 */}
                <div className="bg-surface-container rounded-sm p-8 border border-outline-variant/30 hover:bg-surface-container-high transition-colors group">
                  <div className="font-mono-data text-[10px] text-outline mb-6 group-hover:text-primary transition-colors">
                    MOD_03
                  </div>
                  <h3 className="font-label-caps text-label-caps text-on-background mb-4">
                    AUDIT
                  </h3>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-6">
                    Immutable logging of agent reasoning traces alongside final
                    transaction hashes. Full transparency for deterministic
                    post-mortems.
                  </p>
                  <div className="h-[60px] w-full border-t border-b border-outline-variant/30 flex items-center justify-between">
                    <span className="font-mono-data text-mono-data text-on-surface-variant">
                      STORE
                    </span>
                    <span className="font-mono-data text-mono-data text-primary">
                      IPFS/ARWEAVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Partner Section (KeeperHub) */}
          <section className="bg-surface-container-lowest py-32 border-t border-b border-outline-variant/30">
            <div className="max-w-container-max mx-auto px-margin-page">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 mb-6">
                    <span className="font-label-caps text-label-caps text-outline">
                      POWERED BY
                    </span>
                    <span className="font-label-caps text-label-caps text-on-background bg-surface-container px-2 py-1 rounded-sm border border-outline-variant/30">
                      KEEPERHUB
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-background mb-6">
                    Deterministic execution via robust simulation.
                  </h2>
                  <p className="font-body-base text-body-base text-on-surface-variant mb-8 max-w-md">
                    AgentOps leverages KeeperHub's infrastructure for shadow-fork
                    simulation, gas optimization, and guaranteed onchain
                    execution. Every agent decision is stress-tested before a
                    single wei is spent.
                  </p>
                  <ul className="flex flex-col gap-4 font-mono-data text-mono-data text-on-surface">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        check_box
                      </span>
                      Dry-run simulation on local forks
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        check_box
                      </span>
                      MEV protection layer
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        check_box
                      </span>
                      Automated gas bumping strategies
                    </li>
                  </ul>
                </div>
                {/* Terminal Visualization */}
                <div className="bg-background rounded-sm border border-outline-variant/30 p-6 flex flex-col gap-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4 mb-2">
                    <div className="w-3 h-3 rounded-full bg-error"></div>
                    <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="font-mono-data text-[10px] text-outline ml-4">
                      keeperhub-sim.log
                    </span>
                  </div>
                  <div className="font-mono-data text-[12px] text-on-surface-variant leading-relaxed">
                    <div className="text-outline">&gt;&gt; init simulation fork --chain 1</div>
                    <div>[OK] Forked mainnet at block 19482910</div>
                    <div className="text-outline">&gt;&gt; inject agent_payload.json</div>
                    <div>[OK] Payload parsed. 3 operations found.</div>
                    <div className="text-outline">&gt;&gt; execute --dry-run</div>
                    <div className="text-secondary">
                      [SIM] Op 1: Swap 10 ETH -&gt; USDC... SUCCESS
                    </div>
                    <div className="text-secondary">
                      [SIM] Op 2: Deposit to Aave... SUCCESS
                    </div>
                    <div className="text-secondary">
                      [SIM] Op 3: Rebalance Vault... SUCCESS
                    </div>
                    <div className="text-primary mt-2">
                      &gt;&gt; VERDICT: SAFE TO EXECUTE
                    </div>
                    <div className="text-on-surface">
                      &gt;&gt; routing to KeeperHub mempool...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-outline-variant/30 py-12 bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-margin-page flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-label-caps text-label-caps text-outline">
            AGENTOPS PROTOCOL © 2024
          </div>
          <div className="flex gap-8">
            <Link
              href="/"
              className="text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps"
            >
              DOCUMENTATION
            </Link>
            <Link
              href="/"
              className="text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps"
            >
              SECURITY
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
