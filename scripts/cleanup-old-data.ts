#!/usr/bin/env ts-node
/**
 * Data Cleanup Script
 * Removes old data based on retention policies
 */

import { createClient } from "@supabase/supabase-js";

interface CleanupTask {
  table: string;
  dateColumn: string;
  retentionDays: number;
  description: string;
}

const cleanupTasks: CleanupTask[] = [
  { table: "screenshots", dateColumn: "created_at", retentionDays: 90, description: "Old screenshots" },
  { table: "activity_logs", dateColumn: "timestamp", retentionDays: 365, description: "Activity logs" },
  { table: "sessions", dateColumn: "expires_at", retentionDays: 0, description: "Expired sessions" },
  { table: "notifications", dateColumn: "created_at", retentionDays: 30, description: "Old notifications" },
  { table: "temp_files", dateColumn: "created_at", retentionDays: 1, description: "Temporary files" },
];

async function cleanup(dryRun = true) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  console.log(`🧹 Running cleanup ${dryRun ? "(DRY RUN)" : ""}
`);

  for (const task of cleanupTasks) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - task.retentionDays);
    
    // Count records to delete
    const { count } = await supabase
      .from(task.table)
      .select("*", { count: "exact", head: true })
      .lt(task.dateColumn, cutoffDate.toISOString());

    console.log(`📊 ${task.description}: ${count || 0} records to delete`);
    
    if (!dryRun && count && count > 0) {
      const { error } = await supabase
        .from(task.table)
        .delete()
        .lt(task.dateColumn, cutoffDate.toISOString());
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Deleted ${count} records`);
      }
    }
  }
  
  console.log("
✅ Cleanup complete!");
}

const dryRun = !process.argv.includes("--execute");
cleanup(dryRun);
