import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PARTITIONED_TABLES = [
  'keystroke_logs_partitioned',
  'click_logs_partitioned',
  'productivity_logs_partitioned',
  'mobile_activity_logs_partitioned',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting automatic partition creation...');

    // Create partitions for next 3 months
    const results: { table: string; partition: string | null; error?: string }[] = [];
    
    for (const tableName of PARTITIONED_TABLES) {
      for (let monthOffset = 0; monthOffset <= 3; monthOffset++) {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + monthOffset);
        const partitionDate = targetDate.toISOString().split('T')[0];

        console.log(`Creating partition for ${tableName} - ${partitionDate}`);

        const { data, error } = await supabase.rpc('create_monthly_partition', {
          p_table_name: tableName,
          p_partition_date: partitionDate,
        });

        if (error) {
          console.error(`Error creating partition for ${tableName}:`, error);
          results.push({ table: tableName, partition: null, error: error.message });
        } else {
          console.log(`Partition result for ${tableName}:`, data);
          results.push({ table: tableName, partition: data });
        }
      }
    }

    const created = results.filter(r => r.partition !== null && !r.error);
    const skipped = results.filter(r => r.partition === null && !r.error);
    const errors = results.filter(r => r.error);

    console.log(`Partition creation completed. Created: ${created.length}, Skipped: ${skipped.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Partition creation completed',
        summary: {
          created: created.length,
          skipped: skipped.length,
          errors: errors.length,
        },
        details: results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in create-monthly-partitions:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
