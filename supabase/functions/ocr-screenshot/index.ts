import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { checkRateLimit, RateLimitConfig } from '../_shared/rateLimiting.ts';
import { 
  ocrScreenshotSchema, 
  validateInput, 
  createValidationErrorResponse 
} from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60 * 1000,
  identifier: 'ocr-screenshot',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, RATE_LIMIT_CONFIG);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = validateInput(ocrScreenshotSchema, body);
    
    if (!validation.success) {
      return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
    }

    const { screenshot_url, employee_id, check_sensitive, keywords } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Download screenshot
    const imageResponse = await fetch(screenshot_url);
    if (!imageResponse.ok) {
      throw new Error('Failed to download screenshot');
    }

    // TODO: Implement actual OCR using Google Vision API or similar
    // For now, return a placeholder response
    const extractedText = 'OCR text extraction placeholder';
    
    // Check for sensitive keywords if requested
    let sensitiveMatches: string[] = [];
    if (check_sensitive && keywords && keywords.length > 0) {
      const lowerText = extractedText.toLowerCase();
      sensitiveMatches = keywords.filter(kw => lowerText.includes(kw.toLowerCase()));
    }

    // Get default sensitive keywords from DB
    if (check_sensitive && !keywords) {
      const { data: sensitiveKeywords } = await supabase
        .from('sensitive_keywords')
        .select('keyword')
        .eq('is_active', true);
      
      if (sensitiveKeywords) {
        const lowerText = extractedText.toLowerCase();
        sensitiveMatches = sensitiveKeywords
          .filter(sk => lowerText.includes(sk.keyword.toLowerCase()))
          .map(sk => sk.keyword);
      }
    }

    // Log if sensitive content found
    if (sensitiveMatches.length > 0 && employee_id) {
      await supabase.from('security_violations').insert({
        employee_id,
        violation_type: 'sensitive_content',
        severity: 'high',
        details: {
          screenshot_url,
          matched_keywords: sensitiveMatches,
        },
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        text: extractedText,
        sensitive_matches: sensitiveMatches,
        has_sensitive_content: sensitiveMatches.length > 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
