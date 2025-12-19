// ============================================================
// OCR SCREENSHOT EDGE FUNCTION
// Extracts text from screenshots using OCR with rate limiting
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { validateRequest, ValidationError } from '../_shared/validation.ts';
import { createRateLimiter, rateLimitResponse, addRateLimitHeaders } from '../_shared/rateLimiting.ts';

// ============================================================
// CORS HEADERS
// ============================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// RATE LIMITER (stricter - OCR is expensive)
// ============================================================

const rateLimiter = createRateLimiter('OCR');

// ============================================================
// TYPES
// ============================================================

interface OCRRequest {
  imageUrl?: string;
  imageBase64?: string;
  language?: string;
  screenshotId?: string;
}

interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
  }>;
  processingTimeMs: number;
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Validate request
    const { data, userId } = await validateRequest<OCRRequest>(req, {
      requiredFields: [],
      allowedFields: ['imageUrl', 'imageBase64', 'language', 'screenshotId'],
      customValidation: (d) => {
        if (!d.imageUrl && !d.imageBase64) {
          throw new ValidationError('Either imageUrl or imageBase64 is required');
        }
        return true;
      },
    });

    // Check rate limit (OCR is expensive)
    const rateLimitResult = rateLimiter.check(`ocr:${userId}`);
    if (!rateLimitResult.allowed) {
      console.log(`OCR rate limit exceeded for user ${userId}`);
      return rateLimitResponse(rateLimitResult);
    }

    console.log(`Processing OCR request for user ${userId}`);

    // Get image data
    let imageData: Uint8Array;
    
    if (data.imageBase64) {
      // Decode base64
      imageData = base64ToUint8Array(data.imageBase64);
    } else if (data.imageUrl) {
      // Fetch image from URL
      const imageResponse = await fetch(data.imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      imageData = new Uint8Array(await imageResponse.arrayBuffer());
    } else {
      throw new ValidationError('No image provided');
    }

    // Perform OCR
    const ocrResult = await performOCR(imageData, data.language || 'por+eng');

    // Save result if screenshotId provided
    if (data.screenshotId) {
      await saveOCRResult(data.screenshotId, ocrResult);
    }

    const processingTimeMs = Date.now() - startTime;

    // Return result with rate limit headers
    const successResponse = new Response(
      JSON.stringify({
        success: true,
        result: {
          ...ocrResult,
          processingTimeMs,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

    return addRateLimitHeaders(successResponse, rateLimitResult);

  } catch (error) {
    console.error('OCR error:', error);

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'OCR processing failed', 
        details: error.message,
        processingTimeMs: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================
// OCR PROCESSING
// ============================================================

async function performOCR(
  imageData: Uint8Array,
  language: string
): Promise<Omit<OCRResult, 'processingTimeMs'>> {
  // Use Tesseract.js via API or local processing
  // For production, consider using Google Cloud Vision, AWS Textract, or Azure OCR
  
  const tesseractApiUrl = Deno.env.get('TESSERACT_API_URL');
  
  if (tesseractApiUrl) {
    // Use external Tesseract API
    const response = await fetch(tesseractApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Language': language,
      },
      body: imageData,
    });

    if (!response.ok) {
      throw new Error(`Tesseract API error: ${response.status}`);
    }

    return await response.json();
  }

  // Fallback: Simple placeholder for development
  // In production, implement actual OCR integration
  console.log('Warning: Using mock OCR response - configure TESSERACT_API_URL for real OCR');
  
  return {
    text: '[OCR not configured - set TESSERACT_API_URL]',
    confidence: 0,
    words: [],
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function base64ToUint8Array(base64: string): Uint8Array {
  // Remove data URL prefix if present
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}

async function saveOCRResult(
  screenshotId: string,
  result: Omit<OCRResult, 'processingTimeMs'>
): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase
      .from('screenshots')
      .update({
        ocr_text: result.text,
        ocr_confidence: result.confidence,
        ocr_processed_at: new Date().toISOString(),
      })
      .eq('id', screenshotId);

    console.log(`OCR result saved for screenshot ${screenshotId}`);
  } catch (err) {
    console.error('Failed to save OCR result:', err);
  }
}
