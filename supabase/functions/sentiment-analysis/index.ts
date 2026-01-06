import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SentimentResult {
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  confidence: number;
  keywords: string[];
  emotions?: string[];
}

// Simple lexicon-based sentiment analysis
const POSITIVE_WORDS = new Set([
  "good", "great", "excellent", "amazing", "wonderful", "fantastic", "awesome",
  "happy", "love", "best", "perfect", "success", "successful", "improved",
  "efficient", "productive", "helpful", "positive", "better", "achieved",
  "completed", "accomplished", "resolved", "fixed", "optimized", "enhanced"
]);

const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "horrible", "poor", "worst", "failed",
  "error", "bug", "issue", "problem", "slow", "broken", "crash",
  "frustrated", "angry", "annoyed", "disappointed", "stuck", "blocked",
  "delayed", "missed", "violation", "critical", "urgent", "warning"
]);

const EMOTION_INDICATORS: Record<string, string[]> = {
  frustration: ["frustrated", "annoying", "stuck", "blocked", "impossible"],
  satisfaction: ["satisfied", "happy", "pleased", "good", "great"],
  urgency: ["urgent", "asap", "immediately", "critical", "emergency"],
  concern: ["worried", "concerned", "anxious", "nervous", "uncertain"],
};

function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
  
  let positiveCount = 0;
  let negativeCount = 0;
  const keywords: string[] = [];
  const emotions: string[] = [];

  words.forEach(word => {
    if (POSITIVE_WORDS.has(word)) {
      positiveCount++;
      if (!keywords.includes(word)) keywords.push(word);
    }
    if (NEGATIVE_WORDS.has(word)) {
      negativeCount++;
      if (!keywords.includes(word)) keywords.push(word);
    }
  });

  // Detect emotions
  Object.entries(EMOTION_INDICATORS).forEach(([emotion, indicators]) => {
    if (indicators.some(ind => text.toLowerCase().includes(ind))) {
      emotions.push(emotion);
    }
  });

  const total = positiveCount + negativeCount;
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  let score = 0;

  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    if (score > 0.2) sentiment = "positive";
    else if (score < -0.2) sentiment = "negative";
  }

  const confidence = total > 0 ? Math.min(0.95, 0.5 + (total / words.length) * 2) : 0.3;

  return {
    text: text.substring(0, 200),
    sentiment,
    score: Math.round(score * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    keywords: keywords.slice(0, 10),
    emotions: emotions.length > 0 ? emotions : undefined,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, analyzeActivities = false, period = "24h" } = await req.json();
    const results: SentimentResult[] = [];

    if (texts && Array.isArray(texts)) {
      // Analyze provided texts
      texts.forEach((text: string) => {
        if (text && text.trim()) {
          results.push(analyzeSentiment(text));
        }
      });
    }

    if (analyzeActivities) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const hoursAgo = period === "24h" ? 24 : period === "7d" ? 168 : 720;
      const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

      // Analyze violation descriptions
      const { data: violations } = await supabase
        .from("violations")
        .select("description, type, severity")
        .gte("created_at", since)
        .not("description", "is", null);

      violations?.forEach((v: any) => {
        if (v.description) {
          const result = analyzeSentiment(v.description);
          result.text = `[${v.severity}] ${v.type}: ${result.text}`;
          results.push(result);
        }
      });
    }

    // Calculate aggregate sentiment
    const aggregate = {
      positive: results.filter(r => r.sentiment === "positive").length,
      negative: results.filter(r => r.sentiment === "negative").length,
      neutral: results.filter(r => r.sentiment === "neutral").length,
      averageScore: results.length > 0 
        ? Math.round((results.reduce((s, r) => s + r.score, 0) / results.length) * 100) / 100 
        : 0,
      dominantEmotions: [...new Set(results.flatMap(r => r.emotions || []))],
    };

    return new Response(
      JSON.stringify({
        results,
        aggregate,
        metadata: {
          analyzedCount: results.length,
          generatedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
