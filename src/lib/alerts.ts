import type { NormalizedPool } from "./types";

export type AlertKind =
  | "LIQUIDITY_CHANGE"
  | "VOLUME_SPIKE"
  | "SPREAD_OPPORTUNITY";

export interface AlertRule {
  kind: AlertKind;
  /**
   * Threshold semantics by kind:
   *   LIQUIDITY_CHANGE   — trigger if |Δ TVL| / TVL_prev exceeds threshold (0..1)
   *   VOLUME_SPIKE       — trigger if volume_now / volume_prev exceeds threshold (>=1)
   *   SPREAD_OPPORTUNITY — trigger if spread (bps) is BELOW threshold
   */
  threshold: number;
}

export interface EvaluatedAlert {
  kind: AlertKind;
  triggered: boolean;
  message: string;
}

/**
 * Evaluate a pool against a set of alert rules. Pure function — used
 * both server-side (cron / API routes) and on the client preview.
 */
export function evaluateAlerts(
  pool: NormalizedPool,
  prev: NormalizedPool | null,
  rules: AlertRule[],
): EvaluatedAlert[] {
  return rules.map((rule) => {
    switch (rule.kind) {
      case "LIQUIDITY_CHANGE": {
        if (!prev || prev.tvlUsd <= 0)
          return { kind: rule.kind, triggered: false, message: "no baseline" };
        const change = (pool.tvlUsd - prev.tvlUsd) / prev.tvlUsd;
        const triggered = Math.abs(change) >= rule.threshold;
        return {
          kind: rule.kind,
          triggered,
          message: `TVL ${(change * 100).toFixed(1)}% (threshold ±${(
            rule.threshold * 100
          ).toFixed(1)}%)`,
        };
      }
      case "VOLUME_SPIKE": {
        if (!prev || prev.volume24hUsd <= 0)
          return { kind: rule.kind, triggered: false, message: "no baseline" };
        const ratio = pool.volume24hUsd / prev.volume24hUsd;
        const triggered = ratio >= rule.threshold;
        return {
          kind: rule.kind,
          triggered,
          message: `Volume ratio ${ratio.toFixed(2)}x (threshold ${rule.threshold.toFixed(
            2,
          )}x)`,
        };
      }
      case "SPREAD_OPPORTUNITY": {
        const triggered = pool.spreadBps <= rule.threshold;
        return {
          kind: rule.kind,
          triggered,
          message: `Spread ${pool.spreadBps.toFixed(1)} bps (target ≤ ${rule.threshold.toFixed(
            1,
          )} bps)`,
        };
      }
      default:
        return { kind: rule.kind, triggered: false, message: "unknown rule" };
    }
  });
}

export const DEFAULT_RULES: AlertRule[] = [
  { kind: "LIQUIDITY_CHANGE", threshold: 0.1 }, // ±10%
  { kind: "VOLUME_SPIKE", threshold: 2 }, // 2x baseline
  { kind: "SPREAD_OPPORTUNITY", threshold: 5 }, // ≤ 5 bps
];
