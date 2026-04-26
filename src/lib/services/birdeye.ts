import type { NormalizedPool } from "../types";
import { getMockPools } from "../mock-data";

const BIRDEYE_URL =
  "https://public-api.birdeye.so/defi/v2/tokens/pair_overview" +
  "?token_a=So11111111111111111111111111111111111111112" +
  "&token_b=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface BirdeyePair {
  address: string;
  source?: string;
  liquidity?: number;
  volume_24h_usd?: number;
  price?: number;
  fee?: number;
}

interface BirdeyeResponse {
  data?: { items?: BirdeyePair[] };
}

/**
 * Birdeye requires an API key in `BIRDEYE_API_KEY` (X-API-KEY header).
 * If absent we skip the network call and return mock data so the app
 * still works during local development.
 */
export async function fetchBirdeyePools(): Promise<NormalizedPool[]> {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    return getMockPools().filter((p) => p.dex === "birdeye");
  }
  try {
    const res = await fetch(BIRDEYE_URL, {
      headers: { "X-API-KEY": apiKey, accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`birdeye ${res.status}`);
    const json = (await res.json()) as BirdeyeResponse;
    const items = json.data?.items ?? [];
    return items.slice(0, 4).map((p) => normalize(p));
  } catch {
    return getMockPools().filter((p) => p.dex === "birdeye");
  }
}

function normalize(p: BirdeyePair): NormalizedPool {
  const tvl = Number(p.liquidity) || 0;
  const vol = Number(p.volume_24h_usd) || 0;
  const feeBps = Math.round((Number(p.fee) || 0.0025) * 10_000);
  const slippage1k = Math.max(1, 60 - Math.log10(Math.max(1, tvl)) * 4);
  const spreadBps = feeBps / 2 + 1;
  const riskScore = Math.max(10, 60 - Math.log10(Math.max(1, tvl)) * 5);
  return {
    dex: "birdeye",
    address: p.address,
    baseSymbol: "SOL",
    quoteSymbol: "USDC",
    feeBps,
    tvlUsd: tvl,
    volume24hUsd: vol,
    apr: 0,
    price: Number(p.price) || 0,
    spreadBps,
    slippage1k,
    riskScore,
  };
}
