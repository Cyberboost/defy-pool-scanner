import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchAllPools } from "@/lib/services";
import { DEFAULT_RULES, evaluateAlerts } from "@/lib/alerts";
import { formatBps, formatPct, formatUsd, shortAddress } from "@/lib/utils";
import { Bell } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export default async function AlertsPage() {
  const pools = await fetchAllPools();

  // No persisted "previous" snapshot in this MVP slice — synthesize one
  // by perturbing the current values, so the UI demonstrates triggers.
  const events = pools.flatMap((p) => {
    const prev = {
      ...p,
      tvlUsd: p.tvlUsd * 0.85,
      volume24hUsd: p.volume24hUsd * 0.4,
    };
    return evaluateAlerts(p, prev, DEFAULT_RULES)
      .filter((e) => e.triggered)
      .map((e) => ({ pool: p, ...e }));
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Default rules: ±10% liquidity moves, 2× volume spikes, sub-5 bps
          spread opportunities. Edit thresholds in
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">
            src/lib/alerts.ts
          </code>
          or POST to <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">/api/alerts</code>.
        </p>
      </header>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              No alerts triggered against the current dataset.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((e, i) => (
            <Card key={`${e.pool.address}-${e.kind}-${i}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    {labelFor(e.kind)}
                  </CardTitle>
                  <Badge
                    variant={
                      e.kind === "SPREAD_OPPORTUNITY" ? "success" : "warning"
                    }
                  >
                    {e.pool.dex.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>{e.message}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <Link
                  href={`/pools/${encodeURIComponent(e.pool.address)}`}
                  className="font-mono text-xs hover:text-primary"
                >
                  {shortAddress(e.pool.address, 6, 6)}
                </Link>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>TVL {formatUsd(e.pool.tvlUsd)}</span>
                  <span>Vol {formatUsd(e.pool.volume24hUsd)}</span>
                  <span>APR {formatPct(e.pool.apr)}</span>
                  <span>Spread {formatBps(e.pool.spreadBps)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function labelFor(kind: string) {
  switch (kind) {
    case "LIQUIDITY_CHANGE":
      return "Liquidity change";
    case "VOLUME_SPIKE":
      return "Volume spike";
    case "SPREAD_OPPORTUNITY":
      return "Spread opportunity";
    default:
      return kind;
  }
}
