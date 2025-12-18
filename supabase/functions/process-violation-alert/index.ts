import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Violation {
  id: string;
  employee_name: string;
  violation_type: string;
  severity: string;
  description?: string;
  device?: string;
  created_at: string;
  policy_name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get unnotified critical/high violations
    const { data: violations, error: fetchError } = await supabase
      .from('security_violations')
      .select('*')
      .in('severity', ['critical', 'high'])
      .eq('notified_admin', false)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    if (!violations || violations.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No new violations to process', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${violations.length} violations`);

    // Get violation rules to check notification settings
    const { data: rules } = await supabase
      .from('violation_rules')
      .select('rule_type, notify_admin, notify_employee')
      .eq('is_active', true);

    const rulesMap = new Map(rules?.map(r => [r.rule_type, r]) || []);

    // Process each violation
    const notificationResults = [];
    for (const violation of violations as Violation[]) {
      const rule = rulesMap.get(violation.violation_type);
      const shouldNotifyAdmin = rule?.notify_admin !== false;
      const shouldNotifyEmployee = rule?.notify_employee === true;

      if (!shouldNotifyAdmin) {
        // Mark as processed but don't send
        await supabase
          .from('security_violations')
          .update({ notified_admin: true })
          .eq('id', violation.id);
        continue;
      }

      // Send notification
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `Violação ${violation.severity === 'critical' ? 'Crítica' : 'Alta'} Detectada`,
            body: `${violation.employee_name}: ${violation.description || violation.policy_name}`,
            severity: violation.severity,
            violation_id: violation.id,
            data: {
              employee_name: violation.employee_name,
              device: violation.device,
              violation_type: violation.violation_type,
              timestamp: violation.created_at,
              notify_employee: shouldNotifyEmployee
            }
          }),
        });

        if (response.ok) {
          notificationResults.push({ id: violation.id, status: 'sent' });
        } else {
          const errorText = await response.text();
          console.error(`Failed to send notification for violation ${violation.id}:`, errorText);
          notificationResults.push({ id: violation.id, status: 'failed', error: errorText });
        }
      } catch (notifyError) {
        console.error(`Error sending notification for violation ${violation.id}:`, notifyError);
        notificationResults.push({ id: violation.id, status: 'error' });
      }
    }

    const sentCount = notificationResults.filter(r => r.status === 'sent').length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${violations.length} violations, sent ${sentCount} notifications`,
        count: violations.length,
        sent: sentCount,
        results: notificationResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Process violation alert error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
