/**
 * Shared types for PoolSignal services + UI.
 * These mirror the simplified shape we normalize from
 * Raydium / Orca / Jupiter / Birdeye / DexScreener.
 */

export type DexSlug =
  | "raydium"
  | "orca"
  | "jupiter"
  | "birdeye"
  | "dexscreener";

export interface NormalizedPool {
  /** Source DEX / aggregator slug */
  dex: DexSlug;
  /** On-chain pool address (or canonical id from the source) */
  address: string;
  baseSymbol: string;
  quoteSymbol: string;
  baseMint?: string;
  quoteMint?: string;
  /** Pool fee in basis points (e.g. 25 = 0.25%) */
  feeBps?: number;
  /** Total value locked, USD */
  tvlUsd: number;
  /** Trailing 24h volume, USD */
  volume24hUsd: number;
  /** Quoted price of base in quote (e.g. SOL/USDC) */
  price: number;
  /** Annualised yield estimate, % */
  apr: number;
  /** Bid/ask spread in bps */
  spreadBps: number;
  /** Estimated slippage in bps for a 1k USDC swap */
  slippage1k: number;
  /** Risk score 0..100 (higher = riskier) */
  riskScore: number;
}

export interface PoolHistoryPoint {
  timestamp: number;
  tvlUsd: number;
  volume24hUsd: number;
  price: number;
}

export interface RecentSwap {
  signature: string;
  timestamp: number;
  side: "buy" | "sell";
  amountInUsd: number;
  amountOutUsd: number;
  priceImpactBps: number;
  wallet: string;
}

export interface AiInsightPayload {
  summary: string;
  signals: {
    label: string;
    sentiment: "positive" | "neutral" | "negative";
    detail: string;
  }[];
  generatedAt: number;
}

export interface OpportunityBreakdown {
  liquidity: number;
  volume: number;
  apr: number;
  spread: number;
  slippage: number;
  risk: number;
  total: number;
}
