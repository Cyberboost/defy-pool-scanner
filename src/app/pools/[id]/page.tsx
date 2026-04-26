import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { fetchPoolByAddress, SUPPORTED_DEXES } from "@/lib/services";
import { getMockHistory, getMockSwaps } from "@/lib/mock-data";
import { generateAiInsight } from "@/lib/ai-insight";
import { computeOpportunity } from "@/lib/scoring";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PoolHistoryChart } from "@/components/pool/history-chart";
import { RecentSwaps } from "@/components/pool/recent-swaps";
import { AiInsightPanel } from "@/components/pool/ai-insight-panel";
import { WatchlistButton } from "@/components/watchlist-button";
import {
  classifyRisk,
  formatBps,
  formatPct,
  formatUsd,
  shortAddress,
} from "@/lib/utils";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PoolDetailPage({ params }: Props) {
  const { id } = await params;
  const address = decodeURIComponent(id);
  const pool = await fetchPoolByAddress(address);
  if (!pool) notFound();

  const dex = SUPPORTED_DEXES.find((d) => d.slug === pool.dex);
  const history = getMockHistory(pool.address, 48);
  const swaps = getMockSwaps(pool.address, 25);
  const insight = generateAiInsight(pool);
  const breakdown = computeOpportunity(pool);
  const risk = classifyRisk(pool.riskScore);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            {pool.baseSymbol}/{pool.quoteSymbol}
            <Badge variant="secondary" className="uppercase">
              {pool.dex}
            </Badge>
          </h1>
          <div className="mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>{shortAddress(pool.address, 8, 8)}</span>
            {dex?.url && (
              <a
                className="inline-flex items-center gap-1 hover:text-foreground"
                href={dex.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {dex.name}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <WatchlistButton poolAddress={pool.address} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Stat label="TVL" value={formatUsd(pool.tvlUsd)} />
        <Stat label="24h Volume" value={formatUsd(pool.volume24hUsd)} />
        <Stat label="APR" value={formatPct(pool.apr)} />
        <Stat
          label="Price"
          value={pool.price > 0 ? formatUsd(pool.price) : "—"}
        />
        <Stat label="Spread" value={formatBps(pool.spreadBps)} />
        <Stat label="Slippage 1k" value={formatBps(pool.slippage1k)} />
        <Stat
          label="Risk"
          value={`${risk.label} · ${pool.riskScore.toFixed(0)}`}
          tone={risk.tone}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Liquidity history</CardTitle>
            <CardDescription>
              48h TVL trail (USD). Hover for exact values.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PoolHistoryChart data={history} dataKey="tvlUsd" color="#10b981" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunity score</CardTitle>
            <CardDescription>
              Weighted blend of liquidity, volume, APR, microstructure and risk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 text-4xl font-semibold text-emerald-400">
              {breakdown.total.toFixed(1)}
              <span className="ml-1 text-base text-muted-foreground">/ 100</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Liquidity (25%)", v: breakdown.liquidity },
                { label: "Volume (20%)", v: breakdown.volume },
                { label: "APR (20%)", v: breakdown.apr },
                { label: "Spread (10%)", v: breakdown.spread },
                { label: "Slippage (10%)", v: breakdown.slippage },
                { label: "Risk (15%)", v: breakdown.risk },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{row.label}</span>
                    <span className="text-foreground">{row.v.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${Math.min(100, row.v)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volume history</CardTitle>
          <CardDescription>
            Hourly volume buckets over the last 48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PoolHistoryChart data={history} dataKey="volume24hUsd" color="#60a5fa" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent swaps</CardTitle>
            <CardDescription>
              Latest 25 swaps observed against this pool.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <RecentSwaps swaps={swaps} />
          </CardContent>
        </Card>
        <AiInsightPanel insight={insight} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "low" | "medium" | "high" | "extreme";
}) {
  const toneClass =
    tone === "low"
      ? "text-emerald-400"
      : tone === "medium"
        ? "text-amber-400"
        : tone === "high"
          ? "text-orange-400"
          : tone === "extreme"
            ? "text-red-400"
            : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className={`mt-1 text-lg font-semibold ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
