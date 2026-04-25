import { NextRequest, NextResponse } from "next/server";

interface Alert {
  id: string;
  poolId: string;
  type: string;
  threshold: number;
  triggered: boolean;
  message?: string;
  createdAt: string;
}

const alerts: Alert[] = [];

export async function GET() {
  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const alert: Alert = {
    id: crypto.randomUUID(),
    poolId: body.poolId,
    type: body.type,
    threshold: body.threshold,
    triggered: false,
    message: body.message,
    createdAt: new Date().toISOString(),
  };
  alerts.push(alert);
  return NextResponse.json({ success: true, alert });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const index = alerts.findIndex((a) => a.id === id);
  if (index !== -1) alerts.splice(index, 1);
  return NextResponse.json({ success: true });
}
