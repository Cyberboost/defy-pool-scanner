import { PrismaClient } from "@prisma/client";
import { computeOpportunityScore } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const dexes = await Promise.all([
    prisma.dex.upsert({
      where: { slug: "raydium" },
      update: {},
      create: { name: "Raydium", slug: "raydium", website: "https://raydium.io" },
    }),
    prisma.dex.upsert({
      where: { slug: "orca" },
      update: {},
      create: { name: "Orca", slug: "orca", website: "https://www.orca.so" },
    }),
    prisma.dex.upsert({
      where: { slug: "jupiter" },
      update: {},
      create: { name: "Jupiter", slug: "jupiter", website: "https://jup.ag" },
    }),
    prisma.dex.upsert({
      where: { slug: "birdeye" },
      update: {},
      create: { name: "Birdeye", slug: "birdeye", website: "https://birdeye.so" },
    }),
    prisma.dex.upsert({
      where: { slug: "dexscreener" },
      update: {},
      create: { name: "DexScreener", slug: "dexscreener", website: "https://dexscreener.com" },
    }),
  ]);

  console.log(`Created ${dexes.length} DEXes`);

  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  function genAddress() {
    return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  for (const dex of dexes.slice(0, 3)) {
    for (let i = 0; i < 3; i++) {
      const tvl = Math.random() * 9_500_000 + 500_000;
      const volume24h = Math.random() * tvl * 0.4 + 100_000;
      const apr = Math.random() * 145 + 5;
      const price = Math.random() * 60 + 140;
      const spread = Math.random() * 0.019 + 0.001;
      const slippage = Math.random() * 0.049 + 0.001;
      const riskScore = Math.random() * 0.8 + 0.1;
      const opportunityScore = computeOpportunityScore({ tvl, volume24h, apr, spread, slippage, riskScore });

      const pool = await prisma.pool.create({
        data: {
          address: genAddress(),
          dexId: dex.id,
          baseToken: "SOL",
          quoteToken: "USDC",
          tvl,
          volume24h,
          apr,
          price,
          spread,
          slippage,
          riskScore,
          opportunityScore,
        },
      });

      const now = new Date();
      for (let h = 24; h >= 0; h--) {
        await prisma.poolSnapshot.create({
          data: {
            poolId: pool.id,
            tvl: tvl * (1 + (Math.random() - 0.5) * 0.1),
            volume: volume24h * (1 + (Math.random() - 0.5) * 0.3),
            apr: apr * (1 + (Math.random() - 0.5) * 0.2),
            price: price * (1 + (Math.random() - 0.5) * 0.04),
            spread,
            timestamp: new Date(now.getTime() - h * 3_600_000),
          },
        });
      }

      await prisma.aiInsight.create({
        data: {
          poolId: pool.id,
          insight: `Pool ${pool.address.slice(0, 8)} shows ${opportunityScore > 60 ? "strong" : "moderate"} opportunity with risk score of ${(riskScore * 100).toFixed(0)}.`,
          sentiment: opportunityScore > 60 ? "bullish" : riskScore > 0.7 ? "bearish" : "neutral",
        },
      });
    }
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
