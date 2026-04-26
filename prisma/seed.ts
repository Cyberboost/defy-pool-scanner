import { PrismaClient } from "@prisma/client";
import { getMockPools } from "../src/lib/mock-data";
import { computeOpportunity } from "../src/lib/scoring";
import { SUPPORTED_DEXES } from "../src/lib/services";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seeding PoolSignal database");

  // 1. Demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@poolsignal.local" },
    update: {},
    create: {
      email: "demo@poolsignal.local",
      name: "Demo User",
    },
  });
  console.log(`✔ user ${user.email}`);

  // 2. DEXes
  for (const d of SUPPORTED_DEXES) {
    await prisma.dex.upsert({
      where: { slug: d.slug },
      update: { name: d.name, url: d.url },
      create: { slug: d.slug, name: d.name, url: d.url },
    });
  }
  const dexes = await prisma.dex.findMany();
  console.log(`✔ ${dexes.length} DEXes`);

  // 3. Pools (from mock dataset)
  const mockPools = getMockPools();
  for (const p of mockPools) {
    const dex = dexes.find((d) => d.slug === p.dex);
    if (!dex) continue;
    const opp = computeOpportunity(p);
    await prisma.pool.upsert({
      where: { address: p.address },
      update: {
        tvlUsd: p.tvlUsd,
        volume24hUsd: p.volume24hUsd,
        apr: p.apr,
        price: p.price,
        spreadBps: p.spreadBps,
        slippage1k: p.slippage1k,
        riskScore: p.riskScore,
        opportunity: opp.total,
        feeBps: p.feeBps ?? null,
      },
      create: {
        address: p.address,
        dexId: dex.id,
        baseSymbol: p.baseSymbol,
        quoteSymbol: p.quoteSymbol,
        baseMint: p.baseMint,
        quoteMint: p.quoteMint,
        feeBps: p.feeBps ?? null,
        tvlUsd: p.tvlUsd,
        volume24hUsd: p.volume24hUsd,
        apr: p.apr,
        price: p.price,
        spreadBps: p.spreadBps,
        slippage1k: p.slippage1k,
        riskScore: p.riskScore,
        opportunity: opp.total,
      },
    });
  }
  const pools = await prisma.pool.findMany();
  console.log(`✔ ${pools.length} pools`);

  // 4. Snapshots: a couple of historical points per pool
  for (const pool of pools) {
    for (let i = 0; i < 3; i++) {
      await prisma.poolSnapshot.create({
        data: {
          poolId: pool.id,
          tvlUsd: pool.tvlUsd * (0.9 + Math.random() * 0.2),
          volume24hUsd: pool.volume24hUsd * (0.6 + Math.random() * 0.8),
          price: pool.price * (0.99 + Math.random() * 0.02),
          apr: pool.apr,
          spreadBps: pool.spreadBps,
          slippage1k: pool.slippage1k,
          capturedAt: new Date(Date.now() - i * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log("✔ snapshots");

  // 5. Watchlist + a sample alert for the first two pools
  for (const pool of pools.slice(0, 2)) {
    await prisma.watchlist.upsert({
      where: { userId_poolId: { userId: user.id, poolId: pool.id } },
      update: {},
      create: { userId: user.id, poolId: pool.id },
    });
    await prisma.alert.create({
      data: {
        userId: user.id,
        poolId: pool.id,
        kind: "LIQUIDITY_CHANGE",
        threshold: 0.1,
        message: "Liquidity moved more than ±10%",
      },
    });
  }
  console.log("✔ watchlist + alerts");

  console.log("\nDone — try `npm run dev` and visit http://localhost:3000\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
