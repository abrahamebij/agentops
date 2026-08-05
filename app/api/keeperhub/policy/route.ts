import { NextResponse } from "next/server";
import { getUserPolicy } from "@/src/lib/policy/policyDb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;

    const policy = await getUserPolicy(userId);
    return NextResponse.json({ policy });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch policy";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
