import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(n: number, opts: Intl.NumberFormatOptions = {}) {
  if (!Number.isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000)
    return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    ...opts,
  }).format(n);
}

export function formatPct(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "0%";
  return `${n.toFixed(digits)}%`;
}

export function formatBps(n: number) {
  if (!Number.isFinite(n)) return "0 bps";
  return `${n.toFixed(1)} bps`;
}

export function shortAddress(addr: string, head = 4, tail = 4) {
  if (!addr) return "";
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function classifyRisk(score: number): {
  label: string;
  tone: "low" | "medium" | "high" | "extreme";
} {
  if (score < 25) return { label: "Low", tone: "low" };
  if (score < 50) return { label: "Medium", tone: "medium" };
  if (score < 75) return { label: "High", tone: "high" };
  return { label: "Extreme", tone: "extreme" };
}
