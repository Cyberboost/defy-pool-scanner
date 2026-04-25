"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { MockSnapshot } from "@/lib/mock-data";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PoolChartProps {
  snapshots: MockSnapshot[];
}

export function PoolChart({ snapshots }: PoolChartProps) {
  const data = snapshots.map((s) => ({
    time: format(new Date(s.timestamp), "MMM d HH:mm"),
    tvl: s.tvl,
    volume: s.volume,
    apr: s.apr,
    price: s.price,
  }));

  return (
    <Tabs defaultValue="price">
      <TabsList>
        <TabsTrigger value="price">Price</TabsTrigger>
        <TabsTrigger value="tvl">TVL</TabsTrigger>
        <TabsTrigger value="volume">Volume</TabsTrigger>
        <TabsTrigger value="apr">APR</TabsTrigger>
      </TabsList>

      <TabsContent value="price" className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              formatter={(v) => [formatCurrency(Number(v ?? 0)), "Price"]}
            />
            <Area type="monotone" dataKey="price" stroke="#6366f1" fill="url(#priceGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="tvl" className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              formatter={(v) => [formatCurrency(Number(v ?? 0), true), "TVL"]}
            />
            <Area type="monotone" dataKey="tvl" stroke="#22c55e" fill="url(#tvlGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="volume" className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              formatter={(v) => [formatCurrency(Number(v ?? 0), true), "Volume"]}
            />
            <Bar dataKey="volume" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="apr" className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="aprGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toFixed(0)}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
              formatter={(v) => [`${Number(v ?? 0).toFixed(2)}%`, "APR"]}
            />
            <Area type="monotone" dataKey="apr" stroke="#a855f7" fill="url(#aprGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
}
