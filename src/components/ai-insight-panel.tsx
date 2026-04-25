"use client";

import { MockPool } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { formatPercent } from "@/lib/utils";

interface AiInsightPanelProps {
  pool: MockPool;
}

function generateInsight(pool: MockPool): { text: string; sentiment: "bullish" | "bearish" | "neutral" } {
  const score = pool.opportunityScore;
  const risk = pool.riskScore;
  const apr = pool.apr;

  if (score >= 70 && risk < 0.4) {
    return {
      text: `This pool shows strong fundamentals with a high opportunity score of ${score.toFixed(0)}. The TVL is substantial and volume/TVL ratio is healthy. The low risk score of ${(risk * 100).toFixed(0)} suggests stable liquidity. APR of ${apr.toFixed(1)}% is attractive for liquidity providers. Consider monitoring spread for entry opportunities.`,
      sentiment: "bullish",
    };
  }
  if (score < 40 || risk > 0.7) {
    return {
      text: `Caution advised for this pool. The opportunity score of ${score.toFixed(0)} combined with a risk score of ${(risk * 100).toFixed(0)} indicates elevated risk. The spread of ${formatPercent(pool.spread * 100)} may impact profitability. This pool is better suited for experienced traders who understand the risks.`,
      sentiment: "bearish",
    };
  }
  return {
    text: `This pool presents moderate opportunities. With an opportunity score of ${score.toFixed(0)} and risk level of ${(risk * 100).toFixed(0)}, it offers balanced risk/reward. The current APR of ${apr.toFixed(1)}% provides reasonable yield. Monitor volume trends and liquidity depth before committing significant capital.`,
    sentiment: "neutral",
  };
}

export function AiInsightPanel({ pool }: AiInsightPanelProps) {
  const { text, sentiment } = generateInsight(pool);

  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-purple-400" />
          AI Insight
          <Badge
            variant={
              sentiment === "bullish"
                ? "success"
                : sentiment === "bearish"
                ? "danger"
                : "outline"
            }
            className="ml-auto"
          >
            {sentiment}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
        <p className="text-xs text-muted-foreground/50 mt-3">
          * AI insights are generated from on-chain data patterns and are not financial advice.
        </p>
      </CardContent>
    </Card>
  );
}
