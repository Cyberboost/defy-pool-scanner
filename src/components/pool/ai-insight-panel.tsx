import { Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AiInsightPayload } from "@/lib/types";

export function AiInsightPanel({ insight }: { insight: AiInsightPayload }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI insight
          </CardTitle>
          <Badge variant="muted">heuristic · v1</Badge>
        </div>
        <CardDescription>{insight.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insight.signals.map((s) => {
          const Icon =
            s.sentiment === "positive"
              ? TrendingUp
              : s.sentiment === "negative"
                ? TrendingDown
                : Minus;
          const tone =
            s.sentiment === "positive"
              ? "text-emerald-400"
              : s.sentiment === "negative"
                ? "text-red-400"
                : "text-muted-foreground";
          return (
            <div
              key={s.label}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
            >
              <Icon className={`mt-0.5 h-4 w-4 ${tone}`} />
              <div>
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.detail}</div>
              </div>
            </div>
          );
        })}
        <div className="text-[11px] text-muted-foreground">
          Generated {new Date(insight.generatedAt).toLocaleString()} · this is an
          analytical signal only, not financial advice.
        </div>
      </CardContent>
    </Card>
  );
}
