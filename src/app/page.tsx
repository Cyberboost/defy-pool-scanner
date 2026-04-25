import { fetchAllPools } from "@/lib/api";
import { PoolTable } from "@/components/pool-table";
import { StatsCard } from "@/components/stats-card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Activity, DollarSign, BarChart2, TrendingUp } from "lucide-react";

export const revalidate = 60;

export default async function DashboardPage() {
  const pools = await fetchAllPools();

  const totalTvl = pools.reduce((sum, p) => sum + p.tvl, 0);
  const totalVolume = pools.reduce((sum, p) => sum + p.volume24h, 0);
  const avgApr = pools.length > 0 ? pools.reduce((sum, p) => sum + p.apr, 0) / pools.length : 0;
  const avgOpportunity = pools.length > 0 ? pools.reduce((sum, p) => sum + p.opportunityScore, 0) / pools.length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">SOL/USDC Pool Scanner</h1>
        <p className="text-muted-foreground mt-1">
          Real-time liquidity pool analytics across Raydium, Orca, Jupiter, Birdeye, and DexScreener
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total TVL"
          value={formatCurrency(totalTvl, true)}
          description={`Across ${pools.length} pools`}
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="24h Volume"
          value={formatCurrency(totalVolume, true)}
          description="Total trading volume"
          trend="up"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg APR"
          value={formatPercent(avgApr)}
          description="Average yield across pools"
          trend="neutral"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg Opportunity"
          value={avgOpportunity.toFixed(1)}
          description="Average opportunity score"
          trend="neutral"
          icon={<BarChart2 className="h-4 w-4" />}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Live Pools</h2>
        <PoolTable pools={pools} />
      </div>
    </div>
  );
}
