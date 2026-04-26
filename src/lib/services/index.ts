import type { DexSlug, NormalizedPool } from "../types";
import { computeOpportunity } from "../scoring";
import { fetchRaydiumPools } from "./raydium";
import { fetchOrcaPools } from "./orca";
import { fetchJupiterPools } from "./jupiter";
import { fetchBirdeyePools } from "./birdeye";
import { fetchDexScreenerPools } from "./dexscreener";
import { getMockPools } from "../mock-data";

export interface ScoredPool extends NormalizedPool {
  opportunity: number;
}

/**
 * Returns true if the runtime has been instructed to use mock data only.
 * Useful for tests, CI, and offline development.
 */
export function isMockMode(): boolean {
  return process.env.POOLSIGNAL_MOCK === "1";
}

/**
 * Fetch pools from every supported source in parallel.
 * Each source is independently resilient — a single failing fetch will
 * not bring down the whole dashboard.
 */
export async function fetchAllPools(): Promise<ScoredPool[]> {
  if (isMockMode()) {
    return getMockPools().map(score);
  }

  const results = await Promise.allSettled([
    fetchRaydiumPools(),
    fetchOrcaPools(),
    fetchJupiterPools(),
    fetchBirdeyePools(),
    fetchDexScreenerPools(),
  ]);

  const pools: NormalizedPool[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") pools.push(...r.value);
  }
  // If every source failed (e.g. fully offline) fall back to mocks.
  if (pools.length === 0) pools.push(...getMockPools());
  return pools.map(score);
}

export async function fetchPoolByAddress(
  address: string,
): Promise<ScoredPool | null> {
  const all = await fetchAllPools();
  return all.find((p) => p.address === address) ?? null;
}

export const SUPPORTED_DEXES: { slug: DexSlug; name: string; url?: string }[] = [
  { slug: "raydium", name: "Raydium", url: "https://raydium.io" },
  { slug: "orca", name: "Orca", url: "https://orca.so" },
  { slug: "jupiter", name: "Jupiter", url: "https://jup.ag" },
  { slug: "birdeye", name: "Birdeye", url: "https://birdeye.so" },
  { slug: "dexscreener", name: "DexScreener", url: "https://dexscreener.com" },
];

function score(p: NormalizedPool): ScoredPool {
  return { ...p, opportunity: computeOpportunity(p).total };
}
