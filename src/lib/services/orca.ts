import type { NormalizedPool } from "../types";
import { getMockPools } from "../mock-data";

/**
 * Orca's whirlpool API has changed several times; for the MVP we attempt
 * a generic call and fall back to mocks. Using the public whirlpool
 * stats endpoint when reachable.
 */
const ORCA_URL = "https://api.mainnet.orca.so/v1/whirlpool/list";

interface OrcaWhirlpool {
  address: string;
  tokenA: { symbol: string; mint: string };
  tokenB: { symbol: string; mint: string };
  tvl?: number;
  volume?: { day?: number };
  apr?: { day?: number };
  price?: number;
  feeRate?: number;
}

export async function fetchOrcaPools(): Promise<NormalizedPool[]> {
  try {
    const res = await fetch(ORCA_URL, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`orca ${res.status}`);
    const json = (await res.json()) as { whirlpools: OrcaWhirlpool[] };
    return (json.whirlpools ?? [])
      .filter(
        (w) =>
          (/SOL/i.test(w.tokenA.symbol) && /USDC/i.test(w.tokenB.symbol)) ||
          (/SOL/i.test(w.tokenB.symbol) && /USDC/i.test(w.tokenA.symbol)),
      )
      .slice(0, 6)
      .map((w) => normalize(w));
  } catch {
    return getMockPools().filter((p) => p.dex === "orca");
  }
}

function normalize(w: OrcaWhirlpool): NormalizedPool {
  const tvl = Number(w.tvl) || 0;
  const vol = Number(w.volume?.day) || 0;
  const apr = Number(w.apr?.day) || 0;
  const feeBps = Math.round((Number(w.feeRate) || 0.003) * 10_000);
  const spreadBps = feeBps / 2 + 1;
  const slippage1k = Math.max(1, 50 - Math.log10(Math.max(1, tvl)) * 4);
  const riskScore = Math.max(
    5,
    50 - Math.log10(Math.max(1, tvl)) * 5 + (apr > 50 ? 15 : 0),
  );
  return {
    dex: "orca",
    address: w.address,
    baseSymbol: "SOL",
    quoteSymbol: "USDC",
    feeBps,
    tvlUsd: tvl,
    volume24hUsd: vol,
    apr,
    price: Number(w.price) || 0,
    spreadBps,
    slippage1k,
    riskScore,
  };
}
