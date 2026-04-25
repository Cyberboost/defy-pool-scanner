import { fetchRaydiumPools } from "./raydium";
import { fetchJupiterPools } from "./jupiter";
import { fetchBirdeyePools } from "./birdeye";
import { fetchDexScreenerPools } from "./dexscreener";
import { MOCK_POOLS, MockPool, generateMockPools } from "@/lib/mock-data";
import { computeOpportunityScore } from "@/lib/utils";

export async function fetchAllPools(): Promise<MockPool[]> {
  try {
    const [raydium, jupiter, birdeye, dexscreener] = await Promise.allSettled([
      fetchRaydiumPools(),
      fetchJupiterPools(),
      fetchBirdeyePools(),
      fetchDexScreenerPools(),
    ]);

    const pools: MockPool[] = [];

    if (raydium.status === "fulfilled") pools.push(...raydium.value);
    if (jupiter.status === "fulfilled") pools.push(...jupiter.value);
    if (birdeye.status === "fulfilled") pools.push(...birdeye.value);
    if (dexscreener.status === "fulfilled") pools.push(...dexscreener.value);

    const enrichedPools = pools.map((pool) => ({
      ...pool,
      opportunityScore: computeOpportunityScore({
        tvl: pool.tvl,
        volume24h: pool.volume24h,
        apr: pool.apr,
        spread: pool.spread,
        slippage: pool.slippage,
        riskScore: pool.riskScore,
      }),
    }));

    if (enrichedPools.length === 0) {
      return generateMockPools();
    }

    return enrichedPools.sort((a, b) => b.opportunityScore - a.opportunityScore);
  } catch (error) {
    console.error("Failed to fetch pools, using mock data:", error);
    return MOCK_POOLS;
  }
}

export { fetchRaydiumPools, fetchJupiterPools, fetchBirdeyePools, fetchDexScreenerPools };
