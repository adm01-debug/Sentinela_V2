import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const POSITIVE_WORDS = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'happy', 'love', 'best', 'perfect', 'success', 'productive', 'efficient'];
const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'fail', 'error', 'problem', 'issue', 'slow', 'bug', 'crash'];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { text, texts = [] } = await req.json();
    const analyze = (t: string) => {
      const words = t.toLowerCase().split(/\W+/);
      const pos = words.filter(w => POSITIVE_WORDS.includes(w)).length;
      const neg = words.filter(w => NEGATIVE_WORDS.includes(w)).length;
      const total = pos + neg || 1;
      const score = ((pos - neg) / total + 1) / 2;
      return { text: t.slice(0, 100), score, sentiment: score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral', positiveCount: pos, negativeCount: neg };
    };
    const results = text ? [analyze(text)] : texts.map(analyze);
    const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
    return new Response(JSON.stringify({ results, summary: { averageScore: avgScore, overallSentiment: avgScore > 0.6 ? 'positive' : avgScore < 0.4 ? 'negative' : 'neutral', analyzed: results.length } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
