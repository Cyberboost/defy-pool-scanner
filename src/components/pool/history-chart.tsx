"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PoolHistoryPoint } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

interface Props {
  data: PoolHistoryPoint[];
  dataKey: "tvlUsd" | "volume24hUsd" | "price";
  color?: string;
  yFormatter?: (v: number) => string;
}

export function PoolHistoryChart({
  data,
  dataKey,
  color = "#10b981",
  yFormatter = formatUsd,
}: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) =>
              new Date(v).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            stroke="#475569"
            fontSize={11}
            tickMargin={6}
          />
          <YAxis
            stroke="#475569"
            fontSize={11}
            tickFormatter={(v) => yFormatter(v)}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "#0b1220",
              border: "1px solid #1f2937",
              borderRadius: 8,
              color: "#e5e7eb",
              fontSize: 12,
            }}
            labelFormatter={(v) => new Date(v as number).toLocaleString()}
            formatter={(val: number) => yFormatter(val)}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
