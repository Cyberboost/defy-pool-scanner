import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function computeOpportunityScore(params: {
  tvl: number;
  volume24h: number;
  apr: number;
  spread: number;
  slippage: number;
  riskScore: number;
}): number {
  const { tvl, volume24h, apr, spread, slippage, riskScore } = params;

  const tvlScore = Math.min(100, (tvl / 10_000_000) * 100);
  const volumeRatioScore = tvl > 0 ? Math.min(100, (volume24h / tvl) * 200) : 0;
  const aprScore = Math.min(100, (apr / 200) * 100);
  const spreadScore = Math.max(0, 100 - spread * 500);
  const slippageScore = Math.max(0, 100 - slippage * 1000);
  const riskPenalty = riskScore * 100;

  const score =
    tvlScore * 0.25 +
    volumeRatioScore * 0.2 +
    aprScore * 0.2 +
    spreadScore * 0.15 +
    slippageScore * 0.1 -
    riskPenalty * 0.1;

  return Math.max(0, Math.min(100, score));
}
