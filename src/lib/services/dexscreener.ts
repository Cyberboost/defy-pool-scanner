import type { NormalizedPool } from "../types";
import { getMockPools } from "../mock-data";

const DEXSCREENER_URL =
  "https://api.dexscreener.com/latest/dex/search?q=SOL%20USDC";

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { symbol: string };
  quoteToken: { symbol: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  fdv?: number;
}

interface DexScreenerResponse {
  pairs?: DexScreenerPair[];
}

/**
 * DexScreener exposes a free search endpoint and does not require an
 * API key. We filter to Solana SOL/USDC pairs and normalize the schema.
 * Falls back to mocks on network failure.
 */
export async function fetchDexScreenerPools(): Promise<NormalizedPool[]> {
  try {
    const res = await fetch(DEXSCREENER_URL, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`dexscreener ${res.status}`);
    const json = (await res.json()) as DexScreenerResponse;
    return (json.pairs ?? [])
      .filter(
        (p) =>
          p.chainId === "solana" &&
          /^SOL$/i.test(p.baseToken.symbol) &&
          /^USDC$/i.test(p.quoteToken.symbol),
      )
      .slice(0, 4)
      .map((p) => normalize(p));
  } catch {
    return getMockPools().filter((p) => p.dex === "dexscreener");
  }
}

function normalize(p: DexScreenerPair): NormalizedPool {
  const tvl = Number(p.liquidity?.usd) || 0;
  const vol = Number(p.volume?.h24) || 0;
  const feeBps = 30; // DexScreener doesn't expose fee — assume 0.30%
  const spreadBps = feeBps / 2 + 1;
  const slippage1k = Math.max(1, 60 - Math.log10(Math.max(1, tvl)) * 4);
  const riskScore = Math.max(10, 60 - Math.log10(Math.max(1, tvl)) * 5);
  return {
    dex: "dexscreener",
    address: p.pairAddress,
    baseSymbol: "SOL",
    quoteSymbol: "USDC",
    feeBps,
    tvlUsd: tvl,
    volume24hUsd: vol,
    apr: 0,
    price: Number(p.priceUsd) || 0,
    spreadBps,
    slippage1k,
    riskScore,
  };
}
