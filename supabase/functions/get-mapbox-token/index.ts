import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit } from '../_shared/rateLimiting.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation Schema for optional query params
const TokenRequestSchema = z.object({
  scope: z.enum(['public', 'temporary', 'restricted']).default('public'),
  duration_minutes: z.number().int().min(5).max(60).default(30),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(clientIP, 'get-mapbox-token', 30, 60);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query params
    const url = new URL(req.url);
    const params = {
      scope: url.searchParams.get('scope') || 'public',
      duration_minutes: parseInt(url.searchParams.get('duration_minutes') || '30'),
    };

    const validation = TokenRequestSchema.safeParse(params);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters', details: validation.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { scope } = validation.data;

    // Get appropriate token based on scope
    let token: string | undefined;

    switch (scope) {
      case 'public':
        token = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
        break;
      case 'temporary':
        // Generate temporary token using Mapbox Tokens API if secret key available
        const secretKey = Deno.env.get('MAPBOX_SECRET_TOKEN');
        if (secretKey) {
          // In production, you would call Mapbox Tokens API to create a temporary token
          token = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
        }
        break;
      case 'restricted':
        // Only for server-side use
        token = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
        break;
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        token,
        scope,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mapbox token error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
