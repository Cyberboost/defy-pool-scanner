"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/components/watchlist-button";
import {
  formatBps,
  formatPct,
  formatUsd,
  shortAddress,
} from "@/lib/utils";
import type { ScoredPool } from "@/lib/services";
import { BookmarkPlus, ExternalLink } from "lucide-react";

export default function WatchlistPage() {
  const watchlist = useWatchlist();
  const [pools, setPools] = useState<ScoredPool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/pools")
      .then((r) => r.json())
      .then((d: { pools: ScoredPool[] }) => {
        if (!cancelled) setPools(d.pools ?? []);
      })
      .catch(() => {
        if (!cancelled) setPools([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const watched = pools.filter((p) => watchlist.includes(p.address));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          Pools you are tracking. Stored locally — wire up the
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">/api/watchlist</code>
          route to persist per-user.
        </p>
      </header>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}

      {!loading && watched.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookmarkPlus className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              No pools on your watchlist yet.
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Browse the dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {watched.map((p) => (
          <Card key={p.address}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {p.baseSymbol}/{p.quoteSymbol}
                  <Badge variant="secondary" className="uppercase">
                    {p.dex}
                  </Badge>
                </CardTitle>
                <Link
                  href={`/pools/${encodeURIComponent(p.address)}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Open <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <CardDescription className="font-mono">
                {shortAddress(p.address, 8, 8)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-sm">
              <Metric label="TVL" value={formatUsd(p.tvlUsd)} />
              <Metric label="24h Vol" value={formatUsd(p.volume24hUsd)} />
              <Metric label="APR" value={formatPct(p.apr)} />
              <Metric label="Spread" value={formatBps(p.spreadBps)} />
              <Metric label="Slip 1k" value={formatBps(p.slippage1k)} />
              <Metric
                label="Score"
                value={p.opportunity.toFixed(1)}
                accent
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={accent ? "font-semibold text-emerald-400" : "font-medium"}>
        {value}
      </div>
    </div>
  );
}
