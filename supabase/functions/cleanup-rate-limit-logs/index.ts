import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupSettings {
  enabled: boolean;
  frequencyHours: number;
  logRetentionHours: number;
}

const DEFAULT_CLEANUP_SETTINGS: CleanupSettings = {
  enabled: true,
  frequencyHours: 1,
  logRetentionHours: 24,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get cleanup settings from monitoring_settings
    const { data: settingsData } = await supabase
      .from('monitoring_settings')
      .select('setting_value')
      .eq('setting_key', 'rate_limit_thresholds')
      .single()

    const cleanupSettings: CleanupSettings = settingsData?.setting_value?.cleanup || DEFAULT_CLEANUP_SETTINGS

    // Check if cleanup is enabled
    if (!cleanupSettings.enabled) {
      console.log('Cleanup is disabled in settings. Skipping.')
      return new Response(
        JSON.stringify({ success: true, message: 'Cleanup disabled', skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log(`Starting rate limit logs cleanup... Retention: ${cleanupSettings.logRetentionHours} hours`)

    // Calculate the cutoff time based on retention settings
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - cleanupSettings.logRetentionHours)

    // Delete old rate limit logs
    const { data: deletedLogs, error: deleteError } = await supabase
      .from('rate_limit_logs')
      .delete()
      .lt('window_start', cutoffTime.toISOString())
      .select('id')

    if (deleteError) {
      console.error('Error cleaning up rate limit logs:', deleteError)
      throw deleteError
    }

    const deletedCount = deletedLogs?.length || 0
    console.log(`Cleanup completed. Deleted ${deletedCount} old rate limit log entries.`)

    // Also cleanup expired blocked IPs
    const { data: unblockedData, error: unblockError } = await supabase
      .from('blocked_ips')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true)
      .select('id')

    if (unblockError) {
      console.error('Error deactivating expired blocked IPs:', unblockError)
    } else {
      const expiredCount = unblockedData?.length || 0
      if (expiredCount > 0) {
        console.log(`Deactivated ${expiredCount} expired IP blocks.`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted_rate_limit_logs: deletedCount,
        expired_blocks_deactivated: unblockedData?.length || 0,
        retention_hours: cleanupSettings.logRetentionHours
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: unknown) {
    console.error('Cleanup job failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
