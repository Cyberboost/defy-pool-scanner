import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

/**
 * Watchlist API.
 *
 * GET  /api/watchlist?userId=…  → list pools on a user's watchlist
 * POST /api/watchlist           → add { userId, poolId }
 * DELETE /api/watchlist?id=…    → remove a watchlist row by id
 *
 * The dashboard's `WatchlistButton` uses localStorage so the app
 * works without a database. Wire this route up by passing a
 * `userId` from your auth layer when you're ready to persist.
 */

const PostSchema = z.object({
  userId: z.string().min(1),
  poolId: z.string().min(1),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ items: [] });
  }
  try {
    const items = await prisma.watchlist.findMany({
      where: { userId },
      include: { pool: { include: { dex: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { items: [], error: errorMessage(err) },
      { status: 200 },
    );
  }
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
    const item = await prisma.watchlist.upsert({
      where: {
        userId_poolId: {
          userId: parsed.data.userId,
          poolId: parsed.data.poolId,
        },
      },
      create: parsed.data,
      update: {},
    });
    return NextResponse.json({ item });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  try {
    await prisma.watchlist.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 });
  }
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Unknown error";
}
