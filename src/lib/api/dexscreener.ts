import { MockPool } from "@/lib/mock-data";

const DEXSCREENER_API_BASE = "https://api.dexscreener.com/latest";

export async function fetchDexScreenerPools(): Promise<MockPool[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API_BASE}/dex/search?q=SOL/USDC`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) throw new Error(`DexScreener API error: ${response.status}`);

    const data = await response.json();

    return (data.pairs || [])
      .filter(
        (pair: Record<string, unknown>) =>
          pair.chainId === "solana" &&
          (pair.baseToken as Record<string, unknown>)?.symbol === "SOL" &&
          (pair.quoteToken as Record<string, unknown>)?.symbol === "USDC"
      )
      .slice(0, 5)
      .map((pair: Record<string, unknown>) => ({
        id: pair.pairAddress as string,
        address: pair.pairAddress as string,
        dex: (pair.dexId as string) || "DexScreener",
        dexSlug: "dexscreener",
        baseToken: "SOL",
        quoteToken: "USDC",
        tvl: (pair.liquidity as Record<string, number>)?.usd || 0,
        volume24h: (pair.volume as Record<string, number>)?.h24 || 0,
        apr: 0,
        price: parseFloat(pair.priceUsd as string) || 0,
        spread: 0.003,
        slippage: 0.005,
        riskScore: 0.35,
        opportunityScore: 45,
      }));
  } catch (error) {
    console.error("Failed to fetch DexScreener data:", error);
    return [];
  }
}
