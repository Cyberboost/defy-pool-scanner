import type { NormalizedPool } from "../types";
import { getMockPools } from "../mock-data";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const JUP_PRICE_URL = `https://price.jup.ag/v6/price?ids=SOL&vsToken=USDC`;
const JUP_QUOTE_URL =
  `https://quote-api.jup.ag/v6/quote` +
  `?inputMint=${USDC_MINT}&outputMint=${SOL_MINT}&amount=1000000000&slippageBps=100`;

interface JupQuoteResponse {
  outAmount?: string;
  priceImpactPct?: string;
  routePlan?: { swapInfo?: { ammKey?: string; label?: string } }[];
}

interface JupPriceResponse {
  data?: Record<string, { price?: number }>;
}

/**
 * Jupiter is an aggregator rather than a single AMM, so we synthesize
 * one "Jupiter best route" virtual pool per call. Falls back to mocks
 * if the API is unreachable.
 */
export async function fetchJupiterPools(): Promise<NormalizedPool[]> {
  try {
    const [quoteRes, priceRes] = await Promise.all([
      fetch(JUP_QUOTE_URL, { next: { revalidate: 30 } }),
      fetch(JUP_PRICE_URL, { next: { revalidate: 30 } }),
    ]);
    if (!quoteRes.ok || !priceRes.ok) throw new Error("jup http");
    const quote = (await quoteRes.json()) as JupQuoteResponse;
    const priceJson = (await priceRes.json()) as JupPriceResponse;
    const price = Number(priceJson.data?.SOL?.price) || 0;
    const impactBps = Math.abs(Number(quote.priceImpactPct) || 0) * 10_000;
    const ammKey =
      quote.routePlan?.[0]?.swapInfo?.ammKey ?? "JUP-best-route-SOL-USDC";
    return [
      {
        dex: "jupiter",
        address: ammKey,
        baseSymbol: "SOL",
        quoteSymbol: "USDC",
        feeBps: 10,
        tvlUsd: 0, // aggregator: TVL not directly applicable
        volume24hUsd: 0,
        apr: 0,
        price,
        spreadBps: Math.max(1, impactBps / 2),
        slippage1k: Math.max(1, impactBps),
        riskScore: 15,
      },
    ];
  } catch {
    return getMockPools().filter((p) => p.dex === "jupiter");
  }
}
