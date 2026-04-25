"use client";

import { MockSwap } from "@/lib/mock-data";
import { formatCurrency, formatAddress, cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface RecentSwapsProps {
  swaps: MockSwap[];
}

export function RecentSwaps({ swaps }: RecentSwapsProps) {
  return (
    <div className="space-y-2">
      {swaps.slice(0, 15).map((swap, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-1.5 rounded-full",
                swap.type === "buy"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {swap.type === "buy" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownLeft className="h-3 w-3" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium capitalize">{swap.type}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {formatAddress(swap.txHash)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{formatCurrency(swap.amount, true)}</p>
            <p className="text-xs text-muted-foreground">
              @ {formatCurrency(swap.price)} • {format(new Date(swap.timestamp), "HH:mm")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
