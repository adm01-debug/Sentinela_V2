import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting rate limit logs cleanup...')

    // Call the existing database function to cleanup old logs
    const { data, error } = await supabase.rpc('cleanup_rate_limit_logs')

    if (error) {
      console.error('Error cleaning up rate limit logs:', error)
      throw error
    }

    const deletedCount = data || 0
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
        expired_blocks_deactivated: unblockedData?.length || 0
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
