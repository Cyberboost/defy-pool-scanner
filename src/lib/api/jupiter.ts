import { MockPool } from "@/lib/mock-data";

const JUPITER_API_BASE = "https://quote-api.jup.ag/v6";

export async function fetchJupiterPools(): Promise<MockPool[]> {
  try {
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    const response = await fetch(
      `${JUPITER_API_BASE}/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=1000000000&slippageBps=50`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) throw new Error(`Jupiter API error: ${response.status}`);

    const data = await response.json();
    const price = data.outAmount / 1_000_000 / (data.inAmount / 1_000_000_000);

    return [
      {
        id: "jupiter-sol-usdc",
        address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        dex: "Jupiter",
        dexSlug: "jupiter",
        baseToken: "SOL",
        quoteToken: "USDC",
        tvl: 50_000_000,
        volume24h: 10_000_000,
        apr: 0,
        price,
        spread: 0.001,
        slippage: 0.005,
        riskScore: 0.1,
        opportunityScore: 60,
      },
    ];
  } catch (error) {
    console.error("Failed to fetch Jupiter data:", error);
    return [];
  }
}
