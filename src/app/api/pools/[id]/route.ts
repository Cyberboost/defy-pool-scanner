import { NextRequest, NextResponse } from "next/server";
import { fetchAllPools } from "@/lib/api";
import { generateMockSnapshots, generateMockSwaps } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const pools = await fetchAllPools();
    const pool = pools.find((p) => p.id === id || p.address === id);

    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    const snapshots = generateMockSnapshots(48);
    const swaps = generateMockSwaps(20);

    return NextResponse.json({ pool, snapshots, swaps });
  } catch (error) {
    console.error("Error fetching pool:", error);
    return NextResponse.json({ error: "Failed to fetch pool" }, { status: 500 });
  }
}
