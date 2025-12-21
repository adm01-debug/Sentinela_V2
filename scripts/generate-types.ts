#!/usr/bin/env npx ts-node
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

async function main() {
  console.log("Generating types...");
  await execAsync("npx supabase gen types typescript --local > src/integrations/supabase/types.ts");
  console.log("Types generated!");
}
main();
