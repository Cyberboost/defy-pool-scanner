import { fetchAllPools, isMockMode } from "@/lib/services";
import { StatCards } from "@/components/dashboard/stat-cards";
import { PoolTable } from "@/components/dashboard/pool-table";
import { Badge } from "@/components/ui/badge";

// Re-evaluate every 60s on the server (ISR-style for the dashboard).
export const revalidate = 60;

export default async function DashboardPage() {
  const pools = await fetchAllPools();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            SOL/USDC pool dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Live scan across Raydium, Orca, Jupiter, Birdeye and DexScreener.
            Sort by any metric, drill into a pool for charts, recent swaps and
            an AI insight panel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMockMode() ? "warning" : "success"}>
            {isMockMode() ? "Mock data" : "Live data"}
          </Badge>
          <Badge variant="muted">{pools.length} pools</Badge>
        </div>
      </header>

      <StatCards pools={pools} />
      <PoolTable pools={pools} />
    </div>
  );
}
