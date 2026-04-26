import type { NormalizedPool, OpportunityBreakdown } from "./types";

/**
 * Normalize a value into a 0..100 score using a soft log curve so that
 * very large pools don't completely saturate the score.
 */
function logScore(value: number, max: number): number {
  if (value <= 0) return 0;
  const v = Math.log10(1 + value) / Math.log10(1 + max);
  return Math.max(0, Math.min(100, v * 100));
}

/** Inverse score: smaller-is-better metrics (spread, slippage, risk). */
function inverseScore(value: number, worst: number): number {
  if (!Number.isFinite(value) || value <= 0) return 100;
  const v = 1 - Math.min(1, value / worst);
  return Math.max(0, Math.min(100, v * 100));
}

/**
 * Compute the Opportunity Score for a pool from its liquidity, volume,
 * APR, spread, slippage and risk score.
 *
 * Returns the breakdown (each 0..100) plus a weighted total (0..100).
 */
export function computeOpportunity(
  pool: Pick<
    NormalizedPool,
    "tvlUsd" | "volume24hUsd" | "apr" | "spreadBps" | "slippage1k" | "riskScore"
  >,
): OpportunityBreakdown {
  const liquidity = logScore(pool.tvlUsd, 500_000_000); // cap ~500M
  const volume = logScore(pool.volume24hUsd, 250_000_000);
  const apr = Math.max(0, Math.min(100, (pool.apr / 50) * 100)); // 50% APR == 100
  const spread = inverseScore(pool.spreadBps, 50); // 50 bps is "bad"
  const slippage = inverseScore(pool.slippage1k, 100); // 100 bps is "bad"
  const risk = inverseScore(pool.riskScore, 100);

  // Weighted blend — liquidity & volume dominate, then yield, then microstructure, then risk.
  const total =
    liquidity * 0.25 +
    volume * 0.2 +
    apr * 0.2 +
    spread * 0.1 +
    slippage * 0.1 +
    risk * 0.15;

  return {
    liquidity,
    volume,
    apr,
    spread,
    slippage,
    risk,
    total: Math.round(total * 10) / 10,
  };
}
