import { ExecutionDetail } from "@/src/components/stitch/Executions/ExecutionDetail";

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <ExecutionDetail executionId={resolvedParams.id} />;
}
