import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fetchAllPools } from "@/lib/services";
import { DEFAULT_RULES, evaluateAlerts, type AlertKind } from "@/lib/alerts";

/**
 * Alerts API.
 *
 * GET  /api/alerts            → live preview of triggered alerts using
 *                               in-memory default rules + current pools.
 * POST /api/alerts            → persist a custom alert rule
 *                               { userId?, poolId, kind, threshold }
 */

const AlertKindEnum = z.enum([
  "LIQUIDITY_CHANGE",
  "VOLUME_SPIKE",
  "SPREAD_OPPORTUNITY",
]);

const PostSchema = z.object({
  userId: z.string().optional(),
  poolId: z.string().min(1),
  kind: AlertKindEnum,
  threshold: z.number().finite(),
});

export async function GET() {
  const pools = await fetchAllPools();
  const events = pools.flatMap((p) => {
    const prev = {
      ...p,
      tvlUsd: p.tvlUsd * 0.85,
      volume24hUsd: p.volume24hUsd * 0.4,
    };
    return evaluateAlerts(p, prev, DEFAULT_RULES)
      .filter((e) => e.triggered)
      .map((e) => ({
        kind: e.kind as AlertKind,
        message: e.message,
        pool: {
          dex: p.dex,
          address: p.address,
          tvlUsd: p.tvlUsd,
          volume24hUsd: p.volume24hUsd,
          spreadBps: p.spreadBps,
        },
      }));
  });
  return NextResponse.json({ events, rules: DEFAULT_RULES });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = PostSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const alert = await prisma.alert.create({
      data: {
        userId: parsed.data.userId,
        poolId: parsed.data.poolId,
        kind: parsed.data.kind,
        threshold: parsed.data.threshold,
      },
    });
    return NextResponse.json({ alert });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
