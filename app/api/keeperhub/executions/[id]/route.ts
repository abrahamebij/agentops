import { NextResponse } from "next/server";
import { getExecutionById } from "@/src/lib/db/executionsStore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress") || undefined;

    const record = await getExecutionById(resolvedParams.id, walletAddress);
    if (!record) {
      return NextResponse.json({ error: "Execution record not found" }, { status: 404 });
    }
    return NextResponse.json({ execution: record });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch execution detail";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
