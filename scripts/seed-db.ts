#!/usr/bin/env npx ts-node
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log("Seeding database...");
  
  await supabase.from("teams").insert([
    { name: "Engineering", description: "Tech team" },
    { name: "Sales", description: "Sales team" },
  ]);
  
  console.log("Seed completed!");
}
seed();
