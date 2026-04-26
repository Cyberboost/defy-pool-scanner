import { NextResponse } from "next/server";
import { fetchPoolByAddress } from "@/lib/services";
import { generateAiInsight } from "@/lib/ai-insight";

export const revalidate = 60;

interface RouteContext {
  params: Promise<{ poolId: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { poolId } = await ctx.params;
  const pool = await fetchPoolByAddress(decodeURIComponent(poolId));
  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }
  return NextResponse.json({ insight: generateAiInsight(pool) });
}
