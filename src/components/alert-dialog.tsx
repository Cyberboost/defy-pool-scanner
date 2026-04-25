"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell } from "lucide-react";

interface AlertDialogProps {
  poolId: string;
  poolAddress: string;
}

export function CreateAlertDialog({ poolId, poolAddress }: AlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("LIQUIDITY_CHANGE");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!threshold) return;
    setLoading(true);
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          type,
          threshold: parseFloat(threshold),
          message: `Alert for pool ${poolAddress.slice(0, 8)}...`,
        }),
      });
      setOpen(false);
      setThreshold("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Set Alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Alert</DialogTitle>
          <DialogDescription>
            Set up an alert for pool {poolAddress.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Alert Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIQUIDITY_CHANGE">Liquidity Change</SelectItem>
                <SelectItem value="VOLUME_SPIKE">Volume Spike</SelectItem>
                <SelectItem value="SPREAD_OPPORTUNITY">Spread Opportunity</SelectItem>
                <SelectItem value="APR_CHANGE">APR Change</SelectItem>
                <SelectItem value="RISK_SCORE_CHANGE">Risk Score Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Threshold</label>
            <Input
              type="number"
              placeholder="Enter threshold value"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
