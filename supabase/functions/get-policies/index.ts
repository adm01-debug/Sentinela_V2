import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch active violation rules
    const { data: rules, error: rulesError } = await supabase
      .from("violation_rules")
      .select("id, rule_type, rule_value, severity, description, is_active")
      .eq("is_active", true)
      .order("severity", { ascending: false });

    if (rulesError) {
      console.error("Error fetching rules:", rulesError);
      throw rulesError;
    }

    // Fetch violation counts per rule type and value
    const { data: violations, error: violationsError } = await supabase
      .from("security_violations")
      .select("violation_type, policy_name");

    if (violationsError) {
      console.error("Error fetching violations:", violationsError);
      throw violationsError;
    }

    // Create a map of violation counts by rule value
    const violationCounts: Record<string, number> = {};
    violations?.forEach((v) => {
      const key = v.policy_name?.toLowerCase() || '';
      violationCounts[key] = (violationCounts[key] || 0) + 1;
    });

    // Attach violation count to each rule
    const rulesWithCounts = rules?.map((rule) => {
      const ruleKey = rule.rule_value?.toLowerCase() || '';
      return {
        ...rule,
        violation_count: violationCounts[ruleKey] || 0,
      };
    });

    console.log(`Fetched ${rules?.length || 0} active violation rules with counts`);

    return new Response(JSON.stringify({ rules: rulesWithCounts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in get-policies:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
