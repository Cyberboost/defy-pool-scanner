import { Card, CardContent } from "@/components/ui/card";
import { formatUsd, formatPct } from "@/lib/utils";
import type { ScoredPool } from "@/lib/services";

interface Props {
  pools: ScoredPool[];
}

export function StatCards({ pools }: Props) {
  const totalTvl = pools.reduce((s, p) => s + p.tvlUsd, 0);
  const totalVol = pools.reduce((s, p) => s + p.volume24hUsd, 0);
  const avgApr =
    pools.length > 0
      ? pools.reduce((s, p) => s + p.apr, 0) / pools.length
      : 0;
  const avgScore =
    pools.length > 0
      ? pools.reduce((s, p) => s + p.opportunity, 0) / pools.length
      : 0;

  const items = [
    { label: "Total TVL tracked", value: formatUsd(totalTvl) },
    { label: "24h volume tracked", value: formatUsd(totalVol) },
    { label: "Average APR", value: formatPct(avgApr) },
    { label: "Avg opportunity score", value: avgScore.toFixed(1) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <Card key={it.label}>
          <CardContent className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {it.label}
            </div>
            <div className="mt-1 text-2xl font-semibold">{it.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
