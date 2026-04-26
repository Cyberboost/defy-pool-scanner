"use client";

import { useEffect, useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  poolAddress: string;
}

const STORAGE_KEY = "poolsignal:watchlist";

function readWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeWatchlist(list: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("poolsignal:watchlist-change"));
}

/**
 * Client-side watchlist toggle. The MVP stores watchlists in
 * `localStorage` so the UI is fully usable without a database.
 * The Watchlist page reads from the same source, and the API route
 * `/api/watchlist` exists for when you want to wire it up to Prisma.
 */
export function WatchlistButton({ poolAddress }: Props) {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    setList(readWatchlist());
    const onChange = () => setList(readWatchlist());
    window.addEventListener("poolsignal:watchlist-change", onChange);
    return () =>
      window.removeEventListener("poolsignal:watchlist-change", onChange);
  }, []);

  const watching = list.includes(poolAddress);

  function toggle() {
    const next = watching
      ? list.filter((a) => a !== poolAddress)
      : [...list, poolAddress];
    setList(next);
    writeWatchlist(next);
  }

  return (
    <Button
      variant={watching ? "default" : "outline"}
      size="sm"
      onClick={toggle}
    >
      {watching ? (
        <>
          <BookmarkCheck className="h-4 w-4" /> Watching
        </>
      ) : (
        <>
          <BookmarkPlus className="h-4 w-4" /> Add to watchlist
        </>
      )}
    </Button>
  );
}

export function useWatchlist() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(readWatchlist());
    const onChange = () => setList(readWatchlist());
    window.addEventListener("poolsignal:watchlist-change", onChange);
    return () =>
      window.removeEventListener("poolsignal:watchlist-change", onChange);
  }, []);
  return list;
}
