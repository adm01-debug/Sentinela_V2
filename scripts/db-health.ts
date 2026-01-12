#!/usr/bin/env ts-node
/**
 * Database Health Check Script
 * Checks database connectivity and performance
 */

import { createClient } from "@supabase/supabase-js";

interface HealthCheck {
  name: string;
  status: "ok" | "warning" | "error";
  latency?: number;
  details?: string;
}

async function checkDatabase(): Promise<HealthCheck[]> {
  const results: HealthCheck[] = [];
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Connection check
  const startConn = Date.now();
  try {
    const { error } = await supabase.from("health_check").select("*").limit(1);
    results.push({
      name: "Database Connection",
      status: error ? "error" : "ok",
      latency: Date.now() - startConn,
      details: error?.message,
    });
  } catch (e) {
    results.push({
      name: "Database Connection",
      status: "error",
      details: (e as Error).message,
    });
  }

  // Query performance check
  const startQuery = Date.now();
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .single();
    const latency = Date.now() - startQuery;
    results.push({
      name: "Query Performance",
      status: latency < 100 ? "ok" : latency < 500 ? "warning" : "error",
      latency,
      details: latency > 500 ? "High query latency" : undefined,
    });
  } catch (e) {
    results.push({
      name: "Query Performance",
      status: "error",
      details: (e as Error).message,
    });
  }

  // Replication lag check (if applicable)
  try {
    const { data } = await supabase.rpc("check_replication_lag");
    const lag = data?.lag_seconds || 0;
    results.push({
      name: "Replication Lag",
      status: lag < 1 ? "ok" : lag < 10 ? "warning" : "error",
      details: `${lag}s lag`,
    });
  } catch {
    results.push({
      name: "Replication Lag",
      status: "ok",
      details: "Not applicable",
    });
  }

  return results;
}

async function main() {
  console.log("🔍 Running database health checks...
");
  
  const results = await checkDatabase();
  
  for (const check of results) {
    const icon = check.status === "ok" ? "✅" : check.status === "warning" ? "⚠️" : "❌";
    console.log(`${icon} ${check.name}`);
    if (check.latency) console.log(`   Latency: ${check.latency}ms`);
    if (check.details) console.log(`   Details: ${check.details}`);
  }
  
  const hasErrors = results.some(r => r.status === "error");
  process.exit(hasErrors ? 1 : 0);
}

main();
