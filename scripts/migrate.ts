#!/usr/bin/env npx ts-node
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

async function main() {
  const action = process.argv[2] || "status";
  console.log(`Migration: ${action}`);
  
  if (action === "up") await execAsync("supabase db push");
  else if (action === "status") {
    const { stdout } = await execAsync("supabase migration list");
    console.log(stdout);
  }
}
main();
