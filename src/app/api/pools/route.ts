import { NextResponse } from "next/server";
import { fetchAllPools } from "@/lib/api";

export async function GET() {
  try {
    const pools = await fetchAllPools();
    return NextResponse.json({ pools, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error fetching pools:", error);
    return NextResponse.json({ error: "Failed to fetch pools" }, { status: 500 });
  }
}
