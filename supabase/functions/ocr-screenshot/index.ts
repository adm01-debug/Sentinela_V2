import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation Schemas
const OCRRequestSchema = z.object({
  screenshot_id: z.string().uuid().optional(),
  image_base64: z.string().min(1).optional(),
  image_url: z.string().url().optional(),
  language: z.enum(['eng', 'por', 'spa', 'auto']).default('auto'),
  detect_keywords: z.boolean().default(true),
  keywords: z.array(z.string()).optional(),
  employee_id: z.string().uuid().optional(),
}).refine(
  data => data.screenshot_id || data.image_base64 || data.image_url,
  { message: 'Either screenshot_id, image_base64, or image_url is required' }
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'ocr-screenshot', 20, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validation = OCRRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      screenshot_id, 
      image_base64, 
      image_url, 
      language, 
      detect_keywords,
      keywords,
      employee_id 
    } = validation.data;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let imageData: string | null = null;

    // Get image data
    if (image_base64) {
      imageData = image_base64;
    } else if (image_url) {
      const response = await fetch(image_url);
      const arrayBuffer = await response.arrayBuffer();
      imageData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    } else if (screenshot_id) {
      const { data: screenshot } = await supabase
        .from('screenshots')
        .select('file_path')
        .eq('id', screenshot_id)
        .single();

      if (screenshot?.file_path) {
        const { data } = await supabase.storage
          .from('screenshots')
          .download(screenshot.file_path);
        
        if (data) {
          const arrayBuffer = await data.arrayBuffer();
          imageData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        }
      }
    }

    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Could not retrieve image data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call OCR service (using Google Cloud Vision API as example)
    const visionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    
    let extractedText = '';
    let confidence = 0;

    if (visionApiKey) {
      const visionResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: imageData },
              features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
              imageContext: language !== 'auto' ? {
                languageHints: [language],
              } : undefined,
            }],
          }),
        }
      );

      const visionResult = await visionResponse.json();
      
      if (visionResult.responses?.[0]?.fullTextAnnotation) {
        extractedText = visionResult.responses[0].fullTextAnnotation.text;
        confidence = visionResult.responses[0].textAnnotations?.[0]?.confidence || 0.9;
      }
    } else {
      // Fallback: return placeholder if no OCR service configured
      extractedText = '[OCR service not configured]';
      confidence = 0;
    }

    // Keyword detection
    const detectedKeywords: Array<{ keyword: string; count: number; positions: number[] }> = [];
    
    if (detect_keywords && extractedText) {
      // Get sensitive keywords from database
      let keywordsToCheck = keywords || [];
      
      if (!keywordsToCheck.length) {
        const { data: sensitiveKeywords } = await supabase
          .from('sensitive_keywords')
          .select('keyword')
          .eq('is_active', true);
        
        keywordsToCheck = sensitiveKeywords?.map(k => k.keyword) || [];
      }

      const textLower = extractedText.toLowerCase();
      
      for (const keyword of keywordsToCheck) {
        const keywordLower = keyword.toLowerCase();
        const positions: number[] = [];
        let pos = 0;
        
        while ((pos = textLower.indexOf(keywordLower, pos)) !== -1) {
          positions.push(pos);
          pos += keywordLower.length;
        }
        
        if (positions.length > 0) {
          detectedKeywords.push({
            keyword,
            count: positions.length,
            positions,
          });
        }
      }

      // Create violation if sensitive keywords found
      if (detectedKeywords.length > 0 && employee_id) {
        await supabase.functions.invoke('process-violation-alert', {
          body: {
            violation_id: crypto.randomUUID(),
            employee_id,
            violation_type: 'keyword_detected',
            severity: 'high',
            description: `Sensitive keywords detected: ${detectedKeywords.map(k => k.keyword).join(', ')}`,
            evidence: {
              screenshot_id,
              metadata: { keywords: detectedKeywords },
            },
          },
        });
      }
    }

    // Store OCR result
    if (screenshot_id) {
      await supabase.from('screenshot_ocr').upsert({
        screenshot_id,
        extracted_text: extractedText,
        confidence,
        keywords_found: detectedKeywords,
        processed_at: new Date().toISOString(),
      }, { onConflict: 'screenshot_id' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        text: extractedText,
        confidence,
        keywords_detected: detectedKeywords,
        word_count: extractedText.split(/\s+/).filter(Boolean).length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('OCR error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
