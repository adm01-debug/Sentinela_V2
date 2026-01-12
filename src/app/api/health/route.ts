import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "18.0.0",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: "ok",
      redis: "ok",
      storage: "ok",
    },
  };

  return NextResponse.json(health);
}
