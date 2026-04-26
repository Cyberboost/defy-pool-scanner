"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  classifyRisk,
  cn,
  formatBps,
  formatPct,
  formatUsd,
  shortAddress,
} from "@/lib/utils";
import type { ScoredPool } from "@/lib/services";
import type { DexSlug } from "@/lib/types";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";

const DEX_FILTERS: { slug: DexSlug | "all"; label: string }[] = [
  { slug: "all", label: "All DEXes" },
  { slug: "raydium", label: "Raydium" },
  { slug: "orca", label: "Orca" },
  { slug: "jupiter", label: "Jupiter" },
  { slug: "birdeye", label: "Birdeye" },
  { slug: "dexscreener", label: "DexScreener" },
];

type SortKey =
  | "dex"
  | "tvlUsd"
  | "volume24hUsd"
  | "apr"
  | "price"
  | "spreadBps"
  | "slippage1k"
  | "riskScore"
  | "opportunity";

interface Props {
  pools: ScoredPool[];
}

export function PoolTable({ pools }: Props) {
  const [filter, setFilter] = useState<DexSlug | "all">("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("opportunity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let out = pools;
    if (filter !== "all") out = out.filter((p) => p.dex === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(
        (p) =>
          p.address.toLowerCase().includes(q) || p.dex.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...out].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [pools, filter, query, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {DEX_FILTERS.map((f) => (
            <Button
              key={f.slug}
              size="sm"
              variant={filter === f.slug ? "default" : "outline"}
              onClick={() => setFilter(f.slug)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto w-full sm:w-64">
          <Input
            placeholder="Search address or DEX…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead k="dex" label="DEX" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <TableHead>Pool</TableHead>
              <SortHead k="tvlUsd" label="TVL" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-right" />
              <SortHead k="volume24hUsd" label="24h Vol" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-right" />
              <SortHead k="apr" label="APR" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-right" />
              <SortHead k="price" label="Price" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-right" />
              <SortHead k="spreadBps" label="Spread" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-right" />
              <SortHead k="slippage1k" label="Slip 1k" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-right" />
              <SortHead k="riskScore" label="Risk" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-right" />
              <SortHead k="opportunity" label="Score" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No pools match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p) => {
              const risk = classifyRisk(p.riskScore);
              return (
                <TableRow key={`${p.dex}-${p.address}`}>
                  <TableCell>
                    <Badge variant="secondary" className="uppercase">
                      {p.dex}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/pools/${encodeURIComponent(p.address)}`}
                      className="group inline-flex items-center gap-1.5 font-mono text-xs text-foreground hover:text-primary"
                    >
                      {shortAddress(p.address)}
                      <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                    </Link>
                    <div className="text-[11px] text-muted-foreground">
                      {p.baseSymbol}/{p.quoteSymbol}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatUsd(p.tvlUsd)}</TableCell>
                  <TableCell className="text-right">{formatUsd(p.volume24hUsd)}</TableCell>
                  <TableCell className="text-right">{formatPct(p.apr)}</TableCell>
                  <TableCell className="text-right">
                    {p.price > 0 ? formatUsd(p.price) : "—"}
                  </TableCell>
                  <TableCell className="text-right">{formatBps(p.spreadBps)}</TableCell>
                  <TableCell className="text-right">{formatBps(p.slippage1k)}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        risk.tone === "low"
                          ? "success"
                          : risk.tone === "medium"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {risk.label} · {p.riskScore.toFixed(0)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-semibold",
                        p.opportunity >= 70
                          ? "text-emerald-400"
                          : p.opportunity >= 50
                            ? "text-amber-400"
                            : "text-red-400",
                      )}
                    >
                      {p.opportunity.toFixed(1)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SortHead({
  k,
  label,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  k: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === k;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground transition-colors",
          active && "text-foreground",
          className?.includes("text-right") && "ml-auto",
        )}
      >
        {label}
        {active &&
          (sortDir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          ))}
      </button>
    </TableHead>
  );
}
