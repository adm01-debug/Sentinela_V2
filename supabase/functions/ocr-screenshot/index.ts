import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

// Lovable AI API endpoint for vision models
const LOVABLE_AI_URL = 'https://api.lovable.dev/v1/chat/completions';

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let imageData: string | null = null;
    let imageMimeType = 'image/png';

    // Get image data
    if (image_base64) {
      imageData = image_base64;
    } else if (image_url) {
      console.log('[OCR] Fetching image from URL:', image_url);
      const response = await fetch(image_url);
      const contentType = response.headers.get('content-type') || 'image/png';
      imageMimeType = contentType;
      const arrayBuffer = await response.arrayBuffer();
      imageData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    } else if (screenshot_id) {
      console.log('[OCR] Loading screenshot from storage:', screenshot_id);
      const { data: screenshot } = await supabase
        .from('screen_captures')
        .select('capture_url')
        .eq('id', screenshot_id)
        .single();

      if (screenshot?.capture_url) {
        // Download from storage
        const urlParts = screenshot.capture_url.split('/');
        const filePath = urlParts.slice(-2).join('/');
        
        const { data } = await supabase.storage
          .from('violation-screenshots')
          .download(filePath);
        
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

    let extractedText = '';
    let confidence = 0;

    // Use Lovable AI Vision model for OCR
    if (lovableApiKey) {
      console.log('[OCR] Using Lovable AI Vision for text extraction');
      
      const languageHint = language === 'auto' 
        ? '' 
        : language === 'por' 
          ? 'The text is in Portuguese.' 
          : language === 'spa' 
            ? 'The text is in Spanish.' 
            : 'The text is in English.';

      const visionResponse = await fetch(LOVABLE_AI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Extract ALL visible text from this screenshot. ${languageHint}
                  
Return the extracted text exactly as it appears, preserving:
- Line breaks and formatting
- All words and numbers
- Application names and titles
- URLs if visible

ONLY return the extracted text, nothing else. If no text is visible, return "[NO TEXT DETECTED]".`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageMimeType};base64,${imageData}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
        }),
      });

      if (visionResponse.ok) {
        const visionResult = await visionResponse.json();
        extractedText = visionResult.choices?.[0]?.message?.content || '';
        confidence = extractedText && extractedText !== '[NO TEXT DETECTED]' ? 0.95 : 0;
        console.log('[OCR] Text extracted successfully, length:', extractedText.length);
      } else {
        const errorText = await visionResponse.text();
        console.error('[OCR] Vision API error:', errorText);
      }
    } else {
      console.warn('[OCR] LOVABLE_API_KEY not configured');
      extractedText = '[OCR service not configured - LOVABLE_API_KEY missing]';
      confidence = 0;
    }

    // Keyword detection
    const detectedKeywords: Array<{ keyword: string; count: number; positions: number[] }> = [];
    
    if (detect_keywords && extractedText && extractedText !== '[NO TEXT DETECTED]') {
      console.log('[OCR] Scanning for sensitive keywords');
      
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

      console.log('[OCR] Keywords detected:', detectedKeywords.length);

      // Create violation if sensitive keywords found
      if (detectedKeywords.length > 0 && employee_id) {
        console.log('[OCR] Creating violation alert for detected keywords');
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

    // Update screenshot with OCR result
    if (screenshot_id && extractedText) {
      console.log('[OCR] Updating screenshot record with extracted text');
      await supabase
        .from('screen_captures')
        .update({
          extracted_text: extractedText,
          ocr_processed_at: new Date().toISOString(),
        })
        .eq('id', screenshot_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        text: extractedText,
        confidence,
        keywords_detected: detectedKeywords,
        word_count: extractedText.split(/\s+/).filter(Boolean).length,
        processed_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OCR] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
