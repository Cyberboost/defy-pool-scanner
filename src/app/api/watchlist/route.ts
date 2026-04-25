import { NextRequest, NextResponse } from "next/server";

const watchlist = new Set<string>();

export async function GET() {
  return NextResponse.json({ watchlist: Array.from(watchlist) });
}

export async function POST(request: NextRequest) {
  const { poolId } = await request.json();
  watchlist.add(poolId);
  return NextResponse.json({ success: true, watchlist: Array.from(watchlist) });
}

export async function DELETE(request: NextRequest) {
  const { poolId } = await request.json();
  watchlist.delete(poolId);
  return NextResponse.json({ success: true, watchlist: Array.from(watchlist) });
}
