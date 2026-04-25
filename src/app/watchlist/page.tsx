"use client";

import { useState, useEffect } from "react";
import { MockPool } from "@/lib/mock-data";
import { PoolTable } from "@/components/pool-table";
import { Star } from "lucide-react";

export default function WatchlistPage() {
  const [pools, setPools] = useState<MockPool[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [poolsRes, watchlistRes] = await Promise.all([
        fetch("/api/pools"),
        fetch("/api/watchlist"),
      ]);
      const { pools: allPools } = await poolsRes.json();
      const { watchlist: wl } = await watchlistRes.json();
      setWatchlist(wl);
      setPools(allPools.filter((p: MockPool) => wl.includes(p.id)));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Star className="h-7 w-7 text-yellow-400" />
          Watchlist
        </h1>
        <p className="text-muted-foreground mt-1">
          {watchlist.length} pool{watchlist.length !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {pools.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No pools in watchlist</p>
          <p className="text-sm mt-1">Star pools on the dashboard to add them here.</p>
        </div>
      ) : (
        <PoolTable pools={pools} />
      )}
    </div>
  );
}
