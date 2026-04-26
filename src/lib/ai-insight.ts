import type { AiInsightPayload, NormalizedPool } from "./types";
import { computeOpportunity } from "./scoring";

/**
 * Heuristic AI-style insight generator.
 *
 * The MVP intentionally avoids calling out to a paid LLM provider —
 * instead we synthesize a structured summary from the pool's metrics
 * and the same Opportunity Score breakdown the dashboard uses.
 *
 * If you wire up an LLM later, swap the body of `generateAiInsight`
 * to call your provider and keep the same return shape.
 */
export function generateAiInsight(pool: NormalizedPool): AiInsightPayload {
  const breakdown = computeOpportunity(pool);
  const signals: AiInsightPayload["signals"] = [];

  signals.push({
    label: "Liquidity depth",
    sentiment:
      breakdown.liquidity > 70
        ? "positive"
        : breakdown.liquidity > 40
          ? "neutral"
          : "negative",
    detail:
      breakdown.liquidity > 70
        ? `Deep ${formatUsdShort(pool.tvlUsd)} TVL provides strong execution for size.`
        : breakdown.liquidity > 40
          ? `Moderate ${formatUsdShort(pool.tvlUsd)} TVL — fine for retail size.`
          : `Thin ${formatUsdShort(pool.tvlUsd)} TVL — expect impact on >$1k swaps.`,
  });

  signals.push({
    label: "Volume / TVL turnover",
    sentiment:
      pool.volume24hUsd > pool.tvlUsd * 0.5
        ? "positive"
        : pool.volume24hUsd > pool.tvlUsd * 0.1
          ? "neutral"
          : "negative",
    detail: `24h volume ${formatUsdShort(pool.volume24hUsd)} vs TVL ${formatUsdShort(
      pool.tvlUsd,
    )} (${
      pool.tvlUsd > 0
        ? ((pool.volume24hUsd / pool.tvlUsd) * 100).toFixed(1)
        : "0"
    }% turnover).`,
  });

  signals.push({
    label: "Yield",
    sentiment:
      pool.apr > 25 ? "positive" : pool.apr > 8 ? "neutral" : "negative",
    detail:
      pool.apr > 25
        ? `High ${pool.apr.toFixed(1)}% APR — verify the yield isn't just incentives.`
        : `${pool.apr.toFixed(1)}% APR is in line with similar pairs.`,
  });

  signals.push({
    label: "Microstructure",
    sentiment:
      pool.spreadBps < 5 && pool.slippage1k < 5
        ? "positive"
        : pool.spreadBps < 15
          ? "neutral"
          : "negative",
    detail: `Spread ${pool.spreadBps.toFixed(1)} bps · 1k slippage ${pool.slippage1k.toFixed(1)} bps.`,
  });

  signals.push({
    label: "Risk",
    sentiment:
      pool.riskScore < 25
        ? "positive"
        : pool.riskScore < 50
          ? "neutral"
          : "negative",
    detail: `Composite risk score ${pool.riskScore.toFixed(0)} / 100.`,
  });

  const verdict =
    breakdown.total > 70
      ? `Strong opportunity (${breakdown.total.toFixed(0)}/100). ${pool.dex.toUpperCase()} SOL/USDC offers a balanced profile across liquidity, turnover and microstructure.`
      : breakdown.total > 50
        ? `Decent opportunity (${breakdown.total.toFixed(0)}/100). Watch for the weaker signals before committing size.`
        : `Caution (${breakdown.total.toFixed(0)}/100). Several signals are weak — prefer deeper venues unless you're targeting incentives.`;

  return {
    summary: verdict,
    signals,
    generatedAt: Date.now(),
  };
}

function formatUsdShort(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}
