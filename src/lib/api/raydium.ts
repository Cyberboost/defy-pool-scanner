import { MockPool } from "@/lib/mock-data";

const RAYDIUM_API_BASE = "https://api.raydium.io/v2";

export async function fetchRaydiumPools(): Promise<MockPool[]> {
  if (!process.env.RAYDIUM_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${RAYDIUM_API_BASE}/ammV3/ammPools`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error(`Raydium API error: ${response.status}`);

    const data = await response.json();
    return (data.data || [])
      .filter((pool: Record<string, unknown>) => {
        const mintA = pool.mintA as string;
        const mintB = pool.mintB as string;
        return (
          (mintA?.includes("So1111") || mintB?.includes("So1111")) &&
          (mintA?.includes("EPjFWdd") || mintB?.includes("EPjFWdd"))
        );
      })
      .slice(0, 10)
      .map((pool: Record<string, unknown>) => ({
        id: pool.id as string,
        address: pool.id as string,
        dex: "Raydium",
        dexSlug: "raydium",
        baseToken: "SOL",
        quoteToken: "USDC",
        tvl: (pool.tvl as number) || 0,
        volume24h: (pool.day as Record<string, number>)?.volumeUsd || 0,
        apr: (pool.day as Record<string, number>)?.apr || 0,
        price: (pool.price as number) || 0,
        spread: 0.003,
        slippage: 0.005,
        riskScore: 0.3,
        opportunityScore: 50,
      }));
  } catch (error) {
    console.error("Failed to fetch Raydium pools:", error);
    return [];
  }
}
