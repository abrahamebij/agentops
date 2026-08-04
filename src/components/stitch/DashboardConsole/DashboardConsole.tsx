import Link from "next/link";
import { Sidebar } from "../Sidebar";
import { ConsoleHeader } from "../ConsoleHeader";
import { MdFilterList, MdCheckCircle, MdWarning, MdError } from "react-icons/md";

export function DashboardConsole() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <ConsoleHeader />
        <main className="pt-24 p-8 min-h-screen flex-1">
          <div className="flex flex-col w-full gap-8">
            {/* Metric Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  System Status
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary relative">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                    Live
                  </span>
                </div>
              </div>

              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-secondary-container/20 rounded-full blur-xl group-hover:bg-secondary-container/40 transition-colors"></div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Active Policies
                </span>
                <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                  12
                </span>
              </div>

              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Execution Count
                </span>
                <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                  1,240
                </span>
              </div>

              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Success Rate
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg-mobile text-display-lg-mobile text-primary">
                    99.8%
                  </span>
                </div>
              </div>

              <div className="bg-surface-container rounded-lg p-5 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-outline-variant/30">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Pending Actions
                </span>
                <span className="font-display-lg-mobile text-display-lg-mobile text-on-surface-variant/50">
                  0
                </span>
              </div>
            </section>

            {/* Recent Executions Section */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Recent Executions
                  </h2>
                  <div className="px-2 py-1 rounded bg-surface-container-high font-mono-data text-mono-data text-on-surface-variant text-[10px] border border-outline-variant/30">
                    REAL-TIME TAIL
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors rounded text-primary font-label-caps text-label-caps border border-outline-variant/30">
                  <MdFilterList className="text-[18px]" />
                  FILTER VIEW
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Execution Card 1 */}
                <Link
                  href="/audit-trail"
                  className="bg-surface-container flex flex-col rounded-lg p-5 gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden border border-outline-variant/30"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MdCheckCircle className="text-primary text-[20px]" />
                      <span className="font-mono-data text-mono-data text-on-surface">
                        0x7a9f...e142
                      </span>
                    </div>
                    <span className="font-mono-data text-mono-data text-on-surface-variant text-[11px]">
                      2s ago
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      TRIGGER: ORACLE_UPDATE
                    </span>
                    <p className="font-body-base text-body-base text-on-surface line-clamp-2">
                      Arbitrage policy executed successfully. Rebalanced liquidity pool alpha-7 following price variance &gt; 0.5%.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-4">
                    <span className="px-2 py-1 bg-surface rounded text-[10px] font-mono-data text-mono-data text-on-surface-variant border border-outline-variant/30">
                      GAS: 42 GWEI
                    </span>
                    <span className="px-2 py-1 bg-surface rounded text-[10px] font-mono-data text-mono-data text-on-surface-variant border border-outline-variant/30">
                      LATENCY: 12ms
                    </span>
                  </div>
                </Link>

                {/* Execution Card 2 */}
                <Link
                  href="/audit-trail"
                  className="bg-surface-container flex flex-col rounded-lg p-5 gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden border border-outline-variant/30"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-tertiary"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MdWarning className="text-tertiary text-[20px]" />
                      <span className="font-mono-data text-mono-data text-on-surface">
                        0xb21c...99fd
                      </span>
                    </div>
                    <span className="font-mono-data text-mono-data text-on-surface-variant text-[11px]">
                      14s ago
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      TRIGGER: TIMEOUT_RETRY
                    </span>
                    <p className="font-body-base text-body-base text-on-surface line-clamp-2">
                      RPC node failure on primary endpoint. Fallback sequence initiated. Transaction broadcast delayed by 2 blocks.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-4">
                    <span className="px-2 py-1 bg-surface rounded text-[10px] font-mono-data text-mono-data text-tertiary border border-tertiary/30">
                      RETRIES: 1/3
                    </span>
                  </div>
                </Link>

                {/* Execution Card 3 */}
                <Link
                  href="/audit-trail"
                  className="bg-surface-container flex flex-col rounded-lg p-5 gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden border border-outline-variant/30"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MdError className="text-error text-[20px]" />
                      <span className="font-mono-data text-mono-data text-on-surface">
                        0x11f4...0a9b
                      </span>
                    </div>
                    <span className="font-mono-data text-mono-data text-on-surface-variant text-[11px]">
                      45s ago
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      TRIGGER: MANUAL_OVERRIDE
                    </span>
                    <p className="font-body-base text-body-base text-on-surface line-clamp-2">
                      Execution reverted. Policy threshold violated: Slippage tolerance exceeded max configuration (1.5%).
                    </p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-4">
                    <span className="px-2 py-1 bg-error-container rounded text-[10px] font-mono-data text-mono-data text-on-error-container">
                      ERR_SLIPPAGE_EXCEEDED
                    </span>
                  </div>
                </Link>

                {/* Execution Card 4 */}
                <Link
                  href="/audit-trail"
                  className="bg-surface-container flex flex-col rounded-lg p-5 gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden border border-outline-variant/30"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MdCheckCircle className="text-primary text-[20px]" />
                      <span className="font-mono-data text-mono-data text-on-surface">
                        0x88de...3b21
                      </span>
                    </div>
                    <span className="font-mono-data text-mono-data text-on-surface-variant text-[11px]">
                      1m ago
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      TRIGGER: SCHEDULED_CRON
                    </span>
                    <p className="font-body-base text-body-base text-on-surface line-clamp-2">
                      Daily yield harvest completed. Funds routed to cold storage multi-sig via cross-chain bridge.
                    </p>
                  </div>
                  <div className="flex gap-2 mt-auto pt-4">
                    <span className="px-2 py-1 bg-surface rounded text-[10px] font-mono-data text-mono-data text-on-surface-variant border border-outline-variant/30">
                      GAS: 28 GWEI
                    </span>
                  </div>
                </Link>

                {/* Execution Card 5 */}
                <Link
                  href="/audit-trail"
                  className="bg-surface-container flex flex-col rounded-lg p-5 gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer relative overflow-hidden border border-outline-variant/30"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <MdCheckCircle className="text-primary text-[20px]" />
                      <span className="font-mono-data text-mono-data text-on-surface">
                        0x4c2a...f71e
                      </span>
                    </div>
                    <span className="font-mono-data text-mono-data text-on-surface-variant text-[11px]">
                      3m ago
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      TRIGGER: CONTRACT_EVENT
                    </span>
                    <p className="font-body-base text-body-base text-on-surface line-clamp-2">
                      New validator node registered. Monitoring agent updated active set and adjusted staking allocations.
                    </p>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
