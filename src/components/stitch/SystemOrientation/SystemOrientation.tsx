"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "../PublicHeader";

export function SystemOrientation() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [demoExecuted, setDemoExecuted] = useState<boolean>(false);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <PublicHeader />
      <main className="pt-16 min-h-screen flex-1 relative overflow-hidden bg-background">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, #414754 1px, transparent 1px), linear-gradient(to bottom, #414754 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="flex-1 max-w-container-max mx-auto px-margin-page py-16 flex flex-col justify-center items-center w-full relative z-10 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-3xl flex flex-col gap-8 relative">
            {/* Ambient light effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full shadow-sm border border-outline-variant/30">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="font-mono-data text-mono-data text-on-surface-variant">
                  INIT_SEQUENCE_V1.0
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight max-w-xl">
                Protocol Orientation
              </h1>
              <p className="font-body-base text-body-base text-on-surface-variant max-w-lg">
                Initialize your understanding of the multi-agent orchestration architecture. Complete the orientation sequence to activate your console.
              </p>
            </div>

            {/* Walkthrough Container */}
            <div className="bg-surface-container rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-outline-variant/30">
              {/* Progress Sidebar */}
              <div className="bg-surface-container-high md:w-64 p-8 flex flex-row md:flex-col gap-6 relative border-r border-outline-variant/30">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute left-[44px] top-[64px] bottom-[64px] w-px bg-outline-variant/30 pointer-events-none z-0"></div>

                {/* Step 1 */}
                <button
                  onClick={() => setCurrentStep(1)}
                  className={`flex-1 flex md:flex-row items-center md:items-start gap-4 text-left group transition-all z-10 ${
                    currentStep === 1 ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-full font-mono-data text-mono-data font-medium transition-colors shadow-sm ${
                      currentStep > 1
                        ? "bg-surface-variant text-on-surface-variant"
                        : currentStep === 1
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-lowest text-on-surface-variant"
                    }`}
                  >
                    {currentStep > 1 ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      "1"
                    )}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span
                      className={`font-label-caps text-label-caps transition-colors ${
                        currentStep === 1 ? "text-on-surface font-semibold" : "text-on-surface-variant"
                      }`}
                    >
                      SYSTEM OVERVIEW
                    </span>
                    <span className="font-mono-data text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-1">
                      Verification
                    </span>
                  </div>
                </button>

                {/* Step 2 */}
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`flex-1 flex md:flex-row items-center md:items-start gap-4 text-left group transition-all z-10 ${
                    currentStep === 2 ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-full font-mono-data text-mono-data font-medium transition-colors shadow-sm ${
                      currentStep > 2
                        ? "bg-surface-variant text-on-surface-variant"
                        : currentStep === 2
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-lowest text-on-surface-variant"
                    }`}
                  >
                    {currentStep > 2 ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      "2"
                    )}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span
                      className={`font-label-caps text-label-caps transition-colors ${
                        currentStep === 2 ? "text-on-surface font-semibold" : "text-on-surface-variant"
                      }`}
                    >
                      PROCESS FLOW
                    </span>
                    <span className="font-mono-data text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-1">
                      Audit Trail
                    </span>
                  </div>
                </button>

                {/* Step 3 */}
                <button
                  onClick={() => setCurrentStep(3)}
                  className={`flex-1 flex md:flex-row items-center md:items-start gap-4 text-left group transition-all z-10 ${
                    currentStep === 3 ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-full font-mono-data text-mono-data font-medium transition-colors shadow-sm ${
                      currentStep === 3
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-lowest text-on-surface-variant"
                    }`}
                  >
                    3
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span
                      className={`font-label-caps text-label-caps transition-colors ${
                        currentStep === 3 ? "text-on-surface font-semibold" : "text-on-surface-variant"
                      }`}
                    >
                      ACTIVATION
                    </span>
                    <span className="font-mono-data text-[10px] text-on-surface-variant/50 uppercase tracking-widest mt-1">
                      Demo Exec
                    </span>
                  </div>
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-8 md:p-12 flex flex-col min-h-[420px] relative">
                {/* Step 1 Content */}
                {currentStep === 1 && (
                  <div className="flex flex-col gap-8 h-full justify-between animate-fadeIn">
                    <div className="flex flex-col gap-2">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Autonomous Verification
                      </h2>
                      <p className="font-body-base text-body-base text-on-surface-variant">
                        The protocol utilizes a swarm of specialized AI agents to concurrently verify blockchain state changes before execution, ensuring cryptographic integrity and logical consistency.
                      </p>
                    </div>
                    <div className="flex-1 bg-surface-container-lowest rounded-lg p-6 flex items-center justify-center relative overflow-hidden shadow-inner border border-outline-variant/30 my-4 min-h-[160px]">
                      <svg
                        className="w-full h-full max-h-48 text-primary opacity-80"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 200 100"
                      >
                        <path
                          className="stroke-primary"
                          d="M20 50 H50 L60 20 L80 80 L100 50 H180"
                          strokeDasharray="300"
                          strokeDashoffset="0"
                        />
                        <circle className="fill-primary" cx="20" cy="50" r="4" />
                        <circle
                          className="fill-surface stroke-primary"
                          cx="100"
                          cy="50"
                          r="4"
                        />
                        <circle className="fill-primary" cx="180" cy="50" r="4" />
                      </svg>
                      <div className="absolute bottom-4 right-4 font-mono-data text-[10px] text-primary/70">
                        AGENT_SYNC: ESTABLISHED
                      </div>
                    </div>
                    <div className="flex justify-end mt-auto">
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-on-surface text-surface hover:bg-on-surface-variant rounded shadow-md font-label-caps text-label-caps transition-colors flex items-center gap-2"
                      >
                        CONTINUE{" "}
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 Content */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-8 h-full justify-between animate-fadeIn">
                    <div className="flex flex-col gap-2">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        Observe &amp; Audit
                      </h2>
                      <p className="font-body-base text-body-base text-on-surface-variant">
                        Every transaction is logged in an immutable, human-readable terminal output. Agents provide real-time reasoning trails for complete transparency.
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-6 shadow-inner font-mono-data text-[12px] text-on-surface-variant overflow-hidden flex flex-col gap-2 my-4 border border-outline-variant/30 min-h-[180px]">
                      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-error"></div>
                        <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="ml-2 text-outline">agent_ops.sh</span>
                      </div>
                      <div className="text-primary">&gt; initializing observer node... [OK]</div>
                      <div className="text-primary">&gt; scanning mempool for tx_hash 0x4a9b... [OK]</div>
                      <div className="text-secondary">&gt; agent_audit: analyzing smart contract bytecode</div>
                      <div className="text-secondary">&gt; agent_audit: logic validation passed. Risk score: 0.02</div>
                      <div className="text-on-surface">&gt; status: ready for execution</div>
                      <div className="animate-pulse w-2 h-4 bg-primary mt-1"></div>
                    </div>
                    <div className="flex justify-between mt-auto">
                      <button
                        onClick={handlePrev}
                        className="px-4 py-3 text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps transition-colors"
                      >
                        BACK
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-on-surface text-surface hover:bg-on-surface-variant rounded shadow-md font-label-caps text-label-caps transition-colors flex items-center gap-2"
                      >
                        CONTINUE{" "}
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 Content */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-8 h-full justify-between animate-fadeIn">
                    <div className="flex flex-col gap-2">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        System Ready
                      </h2>
                      <p className="font-body-base text-body-base text-on-surface-variant">
                        Orientation complete. You are now authorized to initiate a live simulation on the testnet cluster.
                      </p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-lg p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden my-4 border border-outline-variant/30 min-h-[200px]">
                      <div className="relative w-28 h-28 mb-6">
                        <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite]"></div>
                        <div className="absolute inset-2 rounded-full border border-primary/50 animate-[spin_7s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-4 rounded-full border border-primary animate-[spin_5s_linear_infinite]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-primary">
                            hub
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setDemoExecuted(true)}
                        className={`group relative px-8 py-4 ${
                          demoExecuted
                            ? "bg-surface-container-high text-primary border border-primary/50"
                            : "bg-primary text-on-primary"
                        } rounded font-label-caps text-label-caps tracking-wider overflow-hidden shadow-lg transition-transform hover:scale-105 active:scale-95`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {demoExecuted ? "SIMULATION ACTIVE" : "TRIGGER DEMO EXECUTION"}
                          <span className="material-symbols-outlined text-[18px]">
                            {demoExecuted ? "check_circle" : "play_arrow"}
                          </span>
                        </span>
                      </button>
                    </div>
                    <div className="flex justify-between mt-auto">
                      <button
                        onClick={handlePrev}
                        className="px-4 py-3 text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps transition-colors"
                      >
                        BACK
                      </button>
                      <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-primary text-on-primary hover:bg-primary-container font-label-caps text-label-caps transition-colors flex items-center gap-2 rounded"
                      >
                        PROCEED TO CONSOLE{" "}
                        <span className="material-symbols-outlined text-[16px]">
                          terminal
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-center mt-4">
              <Link
                href="/dashboard"
                className="text-on-surface-variant hover:text-on-surface font-mono-data text-mono-data underline decoration-on-surface-variant/30 underline-offset-4 transition-colors"
              >
                Skip Orientation Sequence
              </Link>
            </div>
          </div>
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
