"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MockPool } from "@/lib/mock-data";
import { formatCurrency, formatPercent, formatAddress, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, ArrowUpDown, ExternalLink } from "lucide-react";

interface PoolTableProps {
  pools: MockPool[];
}

type SortKey = "tvl" | "volume24h" | "apr" | "price" | "spread" | "slippage" | "riskScore" | "opportunityScore";

function OpportunityBadge({ score }: { score: number }) {
  if (score >= 70) return <Badge variant="success">{score.toFixed(0)}</Badge>;
  if (score >= 40) return <Badge variant="warning">{score.toFixed(0)}</Badge>;
  return <Badge variant="danger">{score.toFixed(0)}</Badge>;
}

function RiskBadge({ score }: { score: number }) {
  if (score < 0.35) return <Badge variant="success">{(score * 100).toFixed(0)}</Badge>;
  if (score < 0.65) return <Badge variant="warning">{(score * 100).toFixed(0)}</Badge>;
  return <Badge variant="danger">{(score * 100).toFixed(0)}</Badge>;
}

export function PoolTable({ pools }: PoolTableProps) {
  const [search, setSearch] = useState("");
  const [dexFilter, setDexFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("opportunityScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((d) => setWatchlist(new Set(d.watchlist)));
  }, []);

  const dexes = Array.from(new Set(pools.map((p) => p.dex)));

  const filtered = pools
    .filter((p) => {
      const matchSearch =
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.dex.toLowerCase().includes(search.toLowerCase());
      const matchDex = dexFilter === "all" || p.dex === dexFilter;
      return matchSearch && matchDex;
    })
    .sort((a, b) => {
      const aVal = a[sortKey] as number;
      const bVal = b[sortKey] as number;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  async function toggleWatchlist(poolId: string) {
    if (watchlist.has(poolId)) {
      await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolId }),
      });
      setWatchlist((prev) => {
        const next = new Set(prev);
        next.delete(poolId);
        return next;
      });
    } else {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolId }),
      });
      setWatchlist((prev) => new Set([...prev, poolId]));
    }
  }

  function SortButton({ col }: { col: SortKey }) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 hover:bg-transparent"
        onClick={() => toggleSort(col)}
      >
        <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by address or DEX..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={dexFilter} onValueChange={setDexFilter}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Filter DEX" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All DEXes</SelectItem>
            {dexes.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>DEX</TableHead>
              <TableHead>Pool Address</TableHead>
              <TableHead>
                TVL <SortButton col="tvl" />
              </TableHead>
              <TableHead>
                24h Volume <SortButton col="volume24h" />
              </TableHead>
              <TableHead>
                APR <SortButton col="apr" />
              </TableHead>
              <TableHead>Price</TableHead>
              <TableHead>
                Spread <SortButton col="spread" />
              </TableHead>
              <TableHead>Slippage</TableHead>
              <TableHead>
                Risk <SortButton col="riskScore" />
              </TableHead>
              <TableHead>
                Opportunity <SortButton col="opportunityScore" />
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                  No pools found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((pool) => (
                <TableRow key={pool.id} className="group">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleWatchlist(pool.id)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          watchlist.has(pool.id)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{pool.dex}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatAddress(pool.address)}
                  </TableCell>
                  <TableCell>{formatCurrency(pool.tvl, true)}</TableCell>
                  <TableCell>{formatCurrency(pool.volume24h, true)}</TableCell>
                  <TableCell>{formatPercent(pool.apr)}</TableCell>
                  <TableCell>{formatCurrency(pool.price)}</TableCell>
                  <TableCell>{formatPercent(pool.spread * 100)}</TableCell>
                  <TableCell>{formatPercent(pool.slippage * 100)}</TableCell>
                  <TableCell>
                    <RiskBadge score={pool.riskScore} />
                  </TableCell>
                  <TableCell>
                    <OpportunityBadge score={pool.opportunityScore} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/pools/${pool.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {pools.length} pools
      </p>
    </div>
  );
}
