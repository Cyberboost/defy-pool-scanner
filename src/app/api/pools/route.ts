import { NextResponse } from "next/server";
import { fetchAllPools } from "@/lib/services";

export const revalidate = 60;

export async function GET() {
  const pools = await fetchAllPools();
  return NextResponse.json({ pools });
}
