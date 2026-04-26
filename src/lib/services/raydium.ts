import type { NormalizedPool } from "../types";
import { getMockPools } from "../mock-data";

const RAYDIUM_PAIRS_URL = "https://api.raydium.io/v2/main/pairs";

interface RaydiumPair {
  ammId: string;
  name: string;
  liquidity: number;
  volume24h: number;
  apr24h?: number;
  apr?: number;
  price: number;
  fee?: number;
}

/**
 * Fetch SOL/USDC pools from Raydium's public pairs endpoint.
 *
 * If the request fails (no network in dev, rate-limited, etc.) we
 * transparently fall back to the deterministic mock dataset so the
 * dashboard always has something to render.
 */
export async function fetchRaydiumPools(): Promise<NormalizedPool[]> {
  try {
    const res = await fetch(RAYDIUM_PAIRS_URL, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`raydium ${res.status}`);
    const data = (await res.json()) as RaydiumPair[];
    return data
      .filter((p) => /SOL[-/]USDC/i.test(p.name))
      .slice(0, 6)
      .map((p) => normalize(p));
  } catch {
    return getMockPools().filter((p) => p.dex === "raydium");
  }
}

function normalize(p: RaydiumPair): NormalizedPool {
  const tvl = Number(p.liquidity) || 0;
  const vol = Number(p.volume24h) || 0;
  const apr = Number(p.apr24h ?? p.apr ?? 0);
  const feeBps = Math.round((Number(p.fee) || 0.0025) * 10_000);
  // Spread/slippage are approximated from fee + a TVL-based factor since
  // Raydium's pairs endpoint does not expose them directly.
  const spreadBps = feeBps / 2 + 1;
  const slippage1k = Math.max(1, 50 - Math.log10(Math.max(1, tvl)) * 4);
  const riskScore = Math.max(
    5,
    50 - Math.log10(Math.max(1, tvl)) * 5 + (apr > 50 ? 15 : 0),
  );
  return {
    dex: "raydium",
    address: p.ammId,
    baseSymbol: "SOL",
    quoteSymbol: "USDC",
    feeBps,
    tvlUsd: tvl,
    volume24hUsd: vol,
    apr,
    price: Number(p.price) || 0,
    spreadBps,
    slippage1k,
    riskScore,
  };
}
