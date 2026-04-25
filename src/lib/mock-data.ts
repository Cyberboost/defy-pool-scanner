import { computeOpportunityScore } from "./utils";

export interface MockPool {
  id: string;
  address: string;
  dex: string;
  dexSlug: string;
  baseToken: string;
  quoteToken: string;
  tvl: number;
  volume24h: number;
  apr: number;
  price: number;
  spread: number;
  slippage: number;
  riskScore: number;
  opportunityScore: number;
}

export interface MockSwap {
  txHash: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  timestamp: Date;
}

export interface MockSnapshot {
  timestamp: Date;
  tvl: number;
  volume: number;
  apr: number;
  price: number;
}

const DEXES = [
  { name: "Raydium", slug: "raydium" },
  { name: "Orca", slug: "orca" },
  { name: "Jupiter", slug: "jupiter" },
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateAddress() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function generateMockPools(): MockPool[] {
  const pools: MockPool[] = [];

  DEXES.forEach((dex) => {
    for (let i = 0; i < 5; i++) {
      const tvl = randomBetween(500_000, 50_000_000);
      const volume24h = randomBetween(100_000, tvl * 0.5);
      const apr = randomBetween(5, 150);
      const price = randomBetween(140, 200);
      const spread = randomBetween(0.001, 0.02);
      const slippage = randomBetween(0.001, 0.05);
      const riskScore = randomBetween(0.1, 0.9);

      pools.push({
        id: `mock-${dex.slug}-${i}`,
        address: generateAddress(),
        dex: dex.name,
        dexSlug: dex.slug,
        baseToken: "SOL",
        quoteToken: "USDC",
        tvl,
        volume24h,
        apr,
        price,
        spread,
        slippage,
        riskScore,
        opportunityScore: computeOpportunityScore({
          tvl,
          volume24h,
          apr,
          spread,
          slippage,
          riskScore,
        }),
      });
    }
  });

  return pools.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export function generateMockSnapshots(hours = 48): MockSnapshot[] {
  const snapshots: MockSnapshot[] = [];
  const now = new Date();
  let baseTvl = randomBetween(5_000_000, 20_000_000);
  let basePrice = randomBetween(150, 180);

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    baseTvl = baseTvl * (1 + randomBetween(-0.05, 0.05));
    basePrice = basePrice * (1 + randomBetween(-0.02, 0.02));
    snapshots.push({
      timestamp,
      tvl: Math.max(0, baseTvl),
      volume: randomBetween(100_000, 2_000_000),
      apr: randomBetween(10, 80),
      price: Math.max(0, basePrice),
    });
  }

  return snapshots;
}

export function generateMockSwaps(count = 20): MockSwap[] {
  const swaps: MockSwap[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const base58Chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const txHash = Array.from({ length: 88 }, () => base58Chars[Math.floor(Math.random() * base58Chars.length)]).join("");
    swaps.push({
      txHash,
      type: Math.random() > 0.5 ? "buy" : "sell",
      amount: randomBetween(100, 50_000),
      price: randomBetween(150, 180),
      timestamp: new Date(now.getTime() - randomBetween(0, 24 * 60 * 60 * 1000)),
    });
  }

  return swaps.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const MOCK_POOLS = generateMockPools();
