import { MockPool } from "@/lib/mock-data";

const BIRDEYE_API_BASE = "https://public-api.birdeye.so";

export async function fetchBirdeyePools(): Promise<MockPool[]> {
  if (!process.env.BIRDEYE_API_KEY) {
    return [];
  }

  try {
    const SOL_MINT = "So11111111111111111111111111111111111111112";

    const response = await fetch(
      `${BIRDEYE_API_BASE}/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=10`,
      {
        headers: {
          "X-API-KEY": process.env.BIRDEYE_API_KEY,
          "x-chain": "solana",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) throw new Error(`Birdeye API error: ${response.status}`);

    const data = await response.json();

    const solToken = data.data?.tokens?.find(
      (t: Record<string, unknown>) => t.address === SOL_MINT
    );

    if (!solToken) return [];

    return [
      {
        id: "birdeye-sol-usdc",
        address: SOL_MINT,
        dex: "Birdeye",
        dexSlug: "birdeye",
        baseToken: "SOL",
        quoteToken: "USDC",
        tvl: (solToken.liquidity as number) || 0,
        volume24h: (solToken.v24hUSD as number) || 0,
        apr: 0,
        price: (solToken.price as number) || 0,
        spread: 0.002,
        slippage: 0.004,
        riskScore: 0.2,
        opportunityScore: 55,
      },
    ];
  } catch (error) {
    console.error("Failed to fetch Birdeye data:", error);
    return [];
  }
}
