import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBps, formatUsd, shortAddress } from "@/lib/utils";
import type { RecentSwap } from "@/lib/types";

export function RecentSwaps({ swaps }: { swaps: RecentSwap[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Side</TableHead>
          <TableHead className="text-right">In</TableHead>
          <TableHead className="text-right">Out</TableHead>
          <TableHead className="text-right">Impact</TableHead>
          <TableHead>Wallet</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {swaps.map((s) => (
          <TableRow key={s.signature}>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(s.timestamp).toLocaleTimeString()}
            </TableCell>
            <TableCell>
              <Badge variant={s.side === "buy" ? "success" : "danger"}>
                {s.side.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{formatUsd(s.amountInUsd)}</TableCell>
            <TableCell className="text-right">{formatUsd(s.amountOutUsd)}</TableCell>
            <TableCell className="text-right">{formatBps(s.priceImpactBps)}</TableCell>
            <TableCell className="font-mono text-xs">
              {shortAddress(s.wallet)}
            </TableCell>
          </TableRow>
        ))}
        {swaps.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
              No recent swaps.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
