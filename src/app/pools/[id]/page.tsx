import { fetchAllPools } from "@/lib/api";
import { generateMockSnapshots, generateMockSwaps } from "@/lib/mock-data";
import { PoolChart } from "@/components/pool-chart";
import { RecentSwaps } from "@/components/recent-swaps";
import { AiInsightPanel } from "@/components/ai-insight-panel";
import { StatsCard } from "@/components/stats-card";
import { CreateAlertDialog } from "@/components/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 30;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PoolDetailPage({ params }: Props) {
  const { id } = await params;
  const pools = await fetchAllPools();
  const pool = pools.find((p) => p.id === id || p.address === id);

  if (!pool) notFound();

  const snapshots = generateMockSnapshots(48);
  const swaps = generateMockSwaps(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{pool.baseToken}/{pool.quoteToken}</h1>
            <Badge variant="outline">{pool.dex}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs text-muted-foreground font-mono">{pool.address}</code>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CreateAlertDialog poolId={pool.id} poolAddress={pool.address} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard title="Price" value={formatCurrency(pool.price)} />
        <StatsCard title="TVL" value={formatCurrency(pool.tvl, true)} />
        <StatsCard title="24h Volume" value={formatCurrency(pool.volume24h, true)} />
        <StatsCard title="APR" value={formatPercent(pool.apr)} />
        <StatsCard title="Spread" value={formatPercent(pool.spread * 100)} />
        <StatsCard title="Slippage" value={formatPercent(pool.slippage * 100)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Opportunity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{pool.opportunityScore.toFixed(0)}</div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pool.opportunityScore}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">{(pool.riskScore * 100).toFixed(0)}</div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all"
                style={{ width: `${pool.riskScore * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <PoolChart snapshots={snapshots} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSwaps swaps={swaps} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <AiInsightPanel pool={pool} />
        </div>
      </div>
    </div>
  );
}
