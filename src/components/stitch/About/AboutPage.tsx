"use client";

import Link from "next/link";
import { PublicHeader } from "../PublicHeader";
import { MdShield, MdPsychology, MdRule, MdHub, MdCheckCircle, MdArrowForward } from "react-icons/md";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary-container selection:text-on-primary-container">
      <PublicHeader />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-container-max mx-auto px-8 flex flex-col gap-16">
          {/* Header Section */}
          <div className="flex flex-col gap-4 max-w-3xl pt-4">
            <span className="font-mono-data text-xs text-primary font-bold tracking-widest uppercase">
              ABOUT AGENTOPS PROTOCOL
            </span>
            <h1 className="font-display-lg text-display-lg text-on-background tracking-tight">
              The AI-Powered Reliability &amp; Guardrail Layer for Onchain Agents
            </h1>
            <p className="font-body-base text-lg text-on-surface-variant leading-relaxed">
              AgentOps provides enterprise-grade safety, multi-agent consensus, and deterministic code policy enforcement for autonomous blockchain operations executed through KeeperHub.
            </p>
          </div>

          {/* Mission & Problem Statement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/30 flex flex-col gap-4">
              <h2 className="font-headline-md text-xl text-on-surface font-semibold flex items-center gap-3">
                <MdShield className="text-error text-2xl" />
                The Problem: Unchecked Autonomous Execution
              </h2>
              <p className="font-body-base text-sm text-on-surface-variant leading-relaxed">
                As autonomous AI agents handle onchain transactions, single-agent failures, hallucinations, or unverified contract interactions risk draining treasury funds. Standard web3 tools lack pre-broadcast consensus voting and deterministic cap limits.
              </p>
            </div>

            <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/30 flex flex-col gap-4">
              <h2 className="font-headline-md text-xl text-on-surface font-semibold flex items-center gap-3">
                <MdCheckCircle className="text-primary text-2xl" />
                The Solution: AgentOps Security Framework
              </h2>
              <p className="font-body-base text-sm text-on-surface-variant leading-relaxed">
                AgentOps introduces a 3-Agent Panel (**Analyst**, **Security**, **Risk**) running parallel evaluations. Only transactions achieving supermajority consensus (≥ 2/3) and passing strict code-level invariant checks are forwarded to KeeperHub for Sepolia execution.
              </p>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="flex flex-col gap-8">
            <h2 className="font-display-lg text-2xl text-on-background">
              Core Security Pillars
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/30 flex flex-col gap-3">
                <MdPsychology className="text-primary text-3xl" />
                <h3 className="font-headline-md text-lg text-on-surface font-bold">
                  1. Multi-Agent Consensus
                </h3>
                <p className="font-body-base text-xs text-on-surface-variant leading-relaxed">
                  Every transaction prompt is evaluated independently by specialized LLM agents. Each agent outputs structured verdicts and natural language reasoning vectors.
                </p>
              </div>

              <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/30 flex flex-col gap-3">
                <MdRule className="text-tertiary text-3xl" />
                <h3 className="font-headline-md text-lg text-on-surface font-bold">
                  2. Deterministic Code Gates
                </h3>
                <p className="font-body-base text-xs text-on-surface-variant leading-relaxed">
                  Hard coded policy checks ($50 max USD cap, 85% min confidence threshold, Sepolia chain validation) enforce non-negotiable safety rules before execution.
                </p>
              </div>

              <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/30 flex flex-col gap-3">
                <MdHub className="text-primary text-3xl" />
                <h3 className="font-headline-md text-lg text-on-surface font-bold">
                  3. KeeperHub Pipeline
                </h3>
                <p className="font-body-base text-xs text-on-surface-variant leading-relaxed">
                  Executes via Safe First-Write dry-run simulation before idempotent broadcast on Sepolia, generating verifiable Etherscan transaction proofs.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Footer Banner */}
          <div className="bg-gradient-to-r from-surface-container-high via-surface-container-highest to-surface-container rounded-2xl p-10 border border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col gap-2">
              <h3 className="font-display-lg text-xl text-on-surface">
                Ready to explore live execution logs?
              </h3>
              <p className="font-body-base text-xs text-on-surface-variant">
                Experience autonomous multi-agent transaction governance in action.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary-container text-on-primary font-label-caps text-xs px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              LAUNCH CONSOLE
              <MdArrowForward className="text-base" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
