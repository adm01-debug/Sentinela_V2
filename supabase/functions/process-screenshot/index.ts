import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const employeeName = formData.get('employeeName') as string;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    if (!file || !employeeName) {
      throw new Error('Missing file or employeeName');
    }

    // Upload to violation-screenshots bucket (real bucket)
    const fileName = `${employeeName}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('violation-screenshots')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('violation-screenshots')
      .getPublicUrl(fileName);

    // Insert into screen_captures table (real table)
    const { error: dbError } = await supabase.from('screen_captures').insert({
      employee_name: employeeName,
      capture_url: urlData.publicUrl,
      app_name: metadata.app_name || null,
      window_title: metadata.window_title || null,
      device: metadata.device || null,
      captured_at: new Date().toISOString(),
    });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true, url: urlData.publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
