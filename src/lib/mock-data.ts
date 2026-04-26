import type {
  DexSlug,
  NormalizedPool,
  PoolHistoryPoint,
  RecentSwap,
} from "./types";

/**
 * Deterministic pseudo-random number generator so the mock dataset is
 * stable across renders / requests but still looks alive.
 */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface MockPoolSpec {
  dex: DexSlug;
  address: string;
  feeBps: number;
  tvlUsd: number;
  volume24hUsd: number;
  apr: number;
  spreadBps: number;
  slippage1k: number;
  riskScore: number;
}

const POOL_SPECS: MockPoolSpec[] = [
  {
    dex: "raydium",
    address: "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2",
    feeBps: 25,
    tvlUsd: 142_000_000,
    volume24hUsd: 88_000_000,
    apr: 18.4,
    spreadBps: 6.1,
    slippage1k: 4.2,
    riskScore: 18,
  },
  {
    dex: "raydium",
    address: "7XawhbbxtsRcQA8KTkHT9f9nc6d69UwqCDh6U5EEbEmX",
    feeBps: 5,
    tvlUsd: 41_500_000,
    volume24hUsd: 36_200_000,
    apr: 9.7,
    spreadBps: 4.4,
    slippage1k: 3.1,
    riskScore: 22,
  },
  {
    dex: "orca",
    address: "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtL45kK6tjuoeQQ",
    feeBps: 4,
    tvlUsd: 89_300_000,
    volume24hUsd: 51_400_000,
    apr: 12.1,
    spreadBps: 3.8,
    slippage1k: 2.7,
    riskScore: 20,
  },
  {
    dex: "orca",
    address: "EGZ7tiLeH62TPV1gL8WwbXGzEPa9zmcpVnnkPKKnrE2U",
    feeBps: 30,
    tvlUsd: 12_700_000,
    volume24hUsd: 9_800_000,
    apr: 24.6,
    spreadBps: 8.2,
    slippage1k: 7.4,
    riskScore: 36,
  },
  {
    dex: "jupiter",
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    feeBps: 10,
    tvlUsd: 67_500_000,
    volume24hUsd: 122_000_000,
    apr: 14.9,
    spreadBps: 2.1,
    slippage1k: 1.6,
    riskScore: 14,
  },
  {
    dex: "birdeye",
    address: "BYE7tQE2gcZk9YrqNgTRCK2Y3hLp5WXP3RgXsoHRPoo1",
    feeBps: 25,
    tvlUsd: 5_300_000,
    volume24hUsd: 6_400_000,
    apr: 31.2,
    spreadBps: 11.5,
    slippage1k: 9.8,
    riskScore: 48,
  },
  {
    dex: "dexscreener",
    address: "DEXr8sDC6JmAo3JxScRX5BJpz5kqRq3Hc6Tvt6eXjvbZ",
    feeBps: 30,
    tvlUsd: 1_900_000,
    volume24hUsd: 3_200_000,
    apr: 42.7,
    spreadBps: 18.4,
    slippage1k: 16.9,
    riskScore: 64,
  },
];

const BASE_PRICE = 178.42; // SOL/USDC

export function getMockPools(): NormalizedPool[] {
  return POOL_SPECS.map((s, i) => {
    const rand = mulberry32(i + 1);
    const drift = (rand() - 0.5) * 1.5; // tiny price variation per pool
    return {
      dex: s.dex,
      address: s.address,
      baseSymbol: "SOL",
      quoteSymbol: "USDC",
      baseMint: SOL_MINT,
      quoteMint: USDC_MINT,
      feeBps: s.feeBps,
      tvlUsd: s.tvlUsd,
      volume24hUsd: s.volume24hUsd,
      apr: s.apr,
      spreadBps: s.spreadBps,
      slippage1k: s.slippage1k,
      riskScore: s.riskScore,
      price: BASE_PRICE + drift,
    } satisfies NormalizedPool;
  });
}

export function getMockHistory(
  poolAddress: string,
  points = 48,
): PoolHistoryPoint[] {
  const seed =
    [...poolAddress].reduce((a, c) => a + c.charCodeAt(0), 0) || 1;
  const rand = mulberry32(seed);
  const pool = POOL_SPECS.find((p) => p.address === poolAddress) ?? POOL_SPECS[0];
  const now = Date.now();
  const out: PoolHistoryPoint[] = [];
  let tvl = pool.tvlUsd;
  let price = BASE_PRICE;
  for (let i = points - 1; i >= 0; i--) {
    const ts = now - i * 60 * 60 * 1000; // 1h buckets
    tvl *= 1 + (rand() - 0.5) * 0.04;
    price *= 1 + (rand() - 0.5) * 0.012;
    const vol = pool.volume24hUsd * (0.6 + rand() * 0.8) * (1 / points) * 24;
    out.push({
      timestamp: ts,
      tvlUsd: Math.max(1, tvl),
      volume24hUsd: Math.max(0, vol),
      price: Math.max(0.01, price),
    });
  }
  return out;
}

export function getMockSwaps(poolAddress: string, count = 20): RecentSwap[] {
  const seed =
    [...poolAddress].reduce((a, c) => a + c.charCodeAt(0), 0) + 7;
  const rand = mulberry32(seed);
  const out: RecentSwap[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const side: "buy" | "sell" = rand() > 0.5 ? "buy" : "sell";
    const amount = 50 + rand() * 25_000;
    const impact = rand() * 12;
    out.push({
      signature: makeSig(rand),
      timestamp: now - i * (30_000 + rand() * 120_000),
      side,
      amountInUsd: amount,
      amountOutUsd: amount * (1 - impact / 10_000),
      priceImpactBps: impact,
      wallet: makeWallet(rand),
    });
  }
  return out;
}

function makeSig(rand: () => number) {
  const alpha =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 64; i++) s += alpha[Math.floor(rand() * alpha.length)];
  return s;
}

function makeWallet(rand: () => number) {
  const alpha =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  let s = "";
  for (let i = 0; i < 44; i++) s += alpha[Math.floor(rand() * alpha.length)];
  return s;
}
