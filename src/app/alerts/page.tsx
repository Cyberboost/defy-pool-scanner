"use client";

import { useState, useEffect } from "react";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Alert {
  id: string;
  poolId: string;
  type: string;
  threshold: number;
  triggered: boolean;
  message?: string;
  createdAt: string;
}

const ALERT_LABELS: Record<string, string> = {
  LIQUIDITY_CHANGE: "Liquidity Change",
  VOLUME_SPIKE: "Volume Spike",
  SPREAD_OPPORTUNITY: "Spread Opportunity",
  APR_CHANGE: "APR Change",
  RISK_SCORE_CHANGE: "Risk Score Change",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => {
        setAlerts(d.alerts);
        setLoading(false);
      });
  }, []);

  async function deleteAlert(id: string) {
    await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

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
          <Bell className="h-7 w-7 text-primary" />
          Alerts
        </h1>
        <p className="text-muted-foreground mt-1">
          {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No alerts configured</p>
          <p className="text-sm mt-1">
            Visit a pool detail page and click &quot;Set Alert&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm">
                    {ALERT_LABELS[alert.type] || alert.type}
                  </CardTitle>
                  <Badge variant={alert.triggered ? "success" : "outline"} className="text-xs">
                    {alert.triggered ? "Triggered" : "Watching"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => deleteAlert(alert.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Threshold: <span className="text-foreground font-medium">{alert.threshold}</span>
                </p>
                {alert.message && (
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Created {format(new Date(alert.createdAt), "MMM d, HH:mm")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
