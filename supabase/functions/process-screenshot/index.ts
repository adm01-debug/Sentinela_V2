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
    const employeeId = formData.get('employeeId') as string;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    if (!file || !employeeId) {
      throw new Error('Missing file or employeeId');
    }

    const fileName = `${employeeId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase.from('screenshots').insert({
      employee_id: employeeId,
      file_path: fileName,
      url: urlData.publicUrl,
      metadata,
      captured_at: new Date().toISOString(),
    });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true, url: urlData.publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
