import { NextResponse } from "next/server";
import { fetchPoolByAddress } from "@/lib/services";
import { getMockHistory, getMockSwaps } from "@/lib/mock-data";
import { generateAiInsight } from "@/lib/ai-insight";
import { computeOpportunity } from "@/lib/scoring";

export const revalidate = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const address = decodeURIComponent(id);
  const pool = await fetchPoolByAddress(address);
  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }
  return NextResponse.json({
    pool,
    breakdown: computeOpportunity(pool),
    history: getMockHistory(pool.address),
    swaps: getMockSwaps(pool.address),
    insight: generateAiInsight(pool),
  });
}
