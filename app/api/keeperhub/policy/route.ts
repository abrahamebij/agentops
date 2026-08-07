import { NextResponse } from "next/server";
import { getUserPolicy, updateUserPolicy } from "@/src/lib/policy/policyDb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress") || undefined;

    const policy = await getUserPolicy(walletAddress);
    return NextResponse.json({ policy });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch policy";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return handleUpdatePolicy(req);
}

export async function PATCH(req: Request) {
  return handleUpdatePolicy(req);
}

async function handleUpdatePolicy(req: Request) {
  try {
    const body = await req.json();
    const walletAddress = body.walletAddress as string | undefined;

    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
    }

    const { maxTransactionUsd, minConfidence, requiredApprovals } = body;

    if (
      typeof maxTransactionUsd !== "number" ||
      typeof minConfidence !== "number" ||
      typeof requiredApprovals !== "number"
    ) {
      return NextResponse.json({ error: "maxTransactionUsd, minConfidence, and requiredApprovals must be numbers" }, { status: 400 });
    }

    // Clamp requiredApprovals to valid range (1–3)
    const clampedApprovals = Math.max(1, Math.min(3, Math.round(requiredApprovals)));

    const updated = await updateUserPolicy(walletAddress, {
      maxTransactionUsd,
      minConfidence,
      requiredApprovals: clampedApprovals,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update policy — user profile not found or DB error" }, { status: 422 });
    }

    return NextResponse.json({ policy: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update policy";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
