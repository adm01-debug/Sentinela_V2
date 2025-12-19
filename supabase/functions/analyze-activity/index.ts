import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration for AI analysis (expensive operation)
const RATE_LIMIT_MAX_REQUESTS = 10; // Max analysis requests per window
const RATE_LIMIT_WINDOW_SECONDS = 300; // 5 minute window

interface AnalysisRequest {
  employee_name?: string;
  report_type: 'individual' | 'team' | 'general';
  period_days?: number;
}

async function checkRateLimit(
  supabase: any,
  identifier: string,
  identifierType: string,
  endpoint: string
): Promise<{ allowed: boolean; retryAfter?: number; remaining?: number }> {
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_endpoint: endpoint,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
    });

    if (error) {
      console.error("Rate limit check error:", error);
      return { allowed: true };
    }

    return {
      allowed: data.allowed,
      retryAfter: data.retry_after_seconds,
      remaining: data.remaining,
    };
  } catch (e) {
    console.error("Rate limit exception:", e);
    return { allowed: true };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";

  try {
    // Rate limit by IP (AI analysis is expensive)
    const rateCheck = await checkRateLimit(supabase, clientIP, "ip", "analyze-activity");
    if (!rateCheck.allowed) {
      console.log(`Rate limit exceeded for analysis from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many analysis requests. Try again later." }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter || 300)
          } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { employee_name, report_type, period_days = 7 }: AnalysisRequest = await req.json();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period_days);

    // Fetch activity data
    let keystrokesQuery = supabase
      .from('keystroke_details')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(1000);

    let clicksQuery = supabase
      .from('click_logs')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(1000);

    let productivityQuery = supabase
      .from('productivity_logs')
      .select('*')
      .gte('recorded_date', startDate.toISOString().split('T')[0])
      .order('recorded_date', { ascending: false });

    let violationsQuery = supabase
      .from('security_violations')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (employee_name && report_type === 'individual') {
      keystrokesQuery = keystrokesQuery.eq('employee_name', employee_name);
      clicksQuery = clicksQuery.eq('employee_name', employee_name);
      productivityQuery = productivityQuery.eq('employee_name', employee_name);
      violationsQuery = violationsQuery.eq('employee_name', employee_name);
    }

    const [keystrokesRes, clicksRes, productivityRes, violationsRes] = await Promise.all([
      keystrokesQuery,
      clicksQuery,
      productivityQuery,
      violationsQuery
    ]);

    // Summarize data for AI
    const keystrokesCount = keystrokesRes.data?.length || 0;
    const clicksCount = clicksRes.data?.length || 0;
    const violations = violationsRes.data || [];
    const productivity = productivityRes.data || [];

    // Calculate stats
    const totalProductiveTime = productivity.reduce((acc, p) => acc + (p.productive_time_seconds || 0), 0);
    const totalUnproductiveTime = productivity.reduce((acc, p) => acc + (p.unproductive_time_seconds || 0), 0);
    const totalNeutralTime = productivity.reduce((acc, p) => acc + (p.neutral_time_seconds || 0), 0);

    // Get unique apps used
    const appsUsed = new Set<string>();
    keystrokesRes.data?.forEach(k => k.app_name && appsUsed.add(k.app_name));
    clicksRes.data?.forEach(c => c.app_name && appsUsed.add(c.app_name));

    // Count violations by type
    const violationsByType: Record<string, number> = {};
    violations.forEach(v => {
      violationsByType[v.violation_type] = (violationsByType[v.violation_type] || 0) + 1;
    });

    // Build context for AI
    const context = `
    Análise de Atividade - ${report_type === 'individual' ? `Funcionário: ${employee_name}` : 'Equipe Geral'}
    Período: Últimos ${period_days} dias
    
    ESTATÍSTICAS:
    - Total de teclas registradas: ${keystrokesCount}
    - Total de cliques registrados: ${clicksCount}
    - Tempo produtivo: ${Math.round(totalProductiveTime / 3600)}h
    - Tempo improdutivo: ${Math.round(totalUnproductiveTime / 3600)}h
    - Tempo neutro: ${Math.round(totalNeutralTime / 3600)}h
    - Aplicativos usados: ${Array.from(appsUsed).join(', ') || 'Nenhum registrado'}
    
    VIOLAÇÕES DE SEGURANÇA (${violations.length} total):
    ${Object.entries(violationsByType).map(([type, count]) => `- ${type}: ${count}`).join('\n') || 'Nenhuma violação'}
    
    DETALHES DAS VIOLAÇÕES:
    ${violations.slice(0, 10).map(v => `- ${v.violation_type}: ${v.description || 'Sem descrição'} (Severidade: ${v.severity})`).join('\n') || 'Nenhum detalhe'}
    `;

    console.log("Sending to AI for analysis...");

    // Call Lovable AI for analysis
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um analista de segurança e produtividade corporativa especializado em monitoramento de funcionários. 
Analise os dados fornecidos e gere um relatório detalhado em português brasileiro.
Forneça:
1. Um resumo executivo
2. Pontuação de risco (0-100, onde 100 é risco máximo)
3. Insights principais sobre comportamento
4. Recomendações específicas de segurança e produtividade
5. Áreas de preocupação e ações sugeridas

Responda em formato JSON com esta estrutura:
{
  "summary": "Resumo executivo...",
  "risk_score": 45,
  "insights": [
    {"category": "produtividade", "finding": "...", "impact": "alto/médio/baixo"},
    ...
  ],
  "recommendations": [
    {"priority": "alta/média/baixa", "action": "...", "reason": "..."},
    ...
  ],
  "concerns": [
    {"area": "...", "description": "...", "suggested_action": "..."},
    ...
  ]
}`
          },
          {
            role: "user",
            content: context
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Erro ao analisar dados com IA");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    console.log("AI Response received:", aiContent?.substring(0, 200));

    // Parse AI response
    let analysisResult;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      analysisResult = {
        summary: aiContent,
        risk_score: 50,
        insights: [],
        recommendations: [],
        concerns: []
      };
    }

    // Save report to database
    const { data: reportData, error: saveError } = await supabase
      .from('ai_analysis_reports')
      .insert({
        employee_name: employee_name || null,
        report_type,
        analysis_period_start: startDate.toISOString(),
        analysis_period_end: new Date().toISOString(),
        summary: analysisResult.summary,
        risk_score: analysisResult.risk_score,
        recommendations: analysisResult.recommendations,
        insights: { 
          insights: analysisResult.insights, 
          concerns: analysisResult.concerns 
        },
        raw_data: {
          keystrokesCount,
          clicksCount,
          violationsCount: violations.length,
          appsUsed: Array.from(appsUsed),
          productivityHours: {
            productive: Math.round(totalProductiveTime / 3600),
            unproductive: Math.round(totalUnproductiveTime / 3600),
            neutral: Math.round(totalNeutralTime / 3600)
          }
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving report:", saveError);
    }

    return new Response(JSON.stringify({
      success: true,
      report: {
        id: reportData?.id,
        ...analysisResult,
        raw_data: {
          keystrokesCount,
          clicksCount,
          violationsCount: violations.length,
          period_days
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erro desconhecido" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
