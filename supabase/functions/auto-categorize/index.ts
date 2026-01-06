import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CategoryResult {
  id: string;
  category: string;
  subcategory?: string;
  confidence: number;
  tags: string[];
}

const CATEGORY_RULES: Record<string, { keywords: string[]; category: string; subcategory?: string }[]> = {
  applications: [
    { keywords: ["chrome", "firefox", "safari", "edge", "browser"], category: "browsing", subcategory: "web_browser" },
    { keywords: ["slack", "teams", "discord", "zoom"], category: "communication", subcategory: "messaging" },
    { keywords: ["outlook", "gmail", "mail", "thunderbird"], category: "communication", subcategory: "email" },
    { keywords: ["vscode", "visual studio", "intellij", "pycharm", "sublime"], category: "development", subcategory: "ide" },
    { keywords: ["word", "docs", "pages", "writer"], category: "productivity", subcategory: "documents" },
    { keywords: ["excel", "sheets", "numbers", "calc"], category: "productivity", subcategory: "spreadsheets" },
    { keywords: ["powerpoint", "slides", "keynote"], category: "productivity", subcategory: "presentations" },
    { keywords: ["photoshop", "figma", "sketch", "illustrator", "canva"], category: "design", subcategory: "graphics" },
    { keywords: ["spotify", "youtube", "netflix", "twitch"], category: "entertainment", subcategory: "media" },
    { keywords: ["facebook", "twitter", "instagram", "linkedin", "tiktok"], category: "social_media" },
    { keywords: ["terminal", "cmd", "powershell", "bash"], category: "development", subcategory: "terminal" },
    { keywords: ["git", "github", "gitlab", "bitbucket"], category: "development", subcategory: "version_control" },
  ],
  activities: [
    { keywords: ["typing", "keystroke", "input"], category: "active_work" },
    { keywords: ["idle", "away", "inactive"], category: "idle" },
    { keywords: ["meeting", "call", "conference"], category: "communication", subcategory: "meetings" },
    { keywords: ["screenshot", "capture"], category: "monitoring" },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, itemType = "applications" } = await req.json();
    const rules = CATEGORY_RULES[itemType] || CATEGORY_RULES.applications;
    const results: CategoryResult[] = [];

    for (const item of items) {
      const itemLower = (typeof item === "string" ? item : item.name || item.application || "").toLowerCase();
      let bestMatch: { category: string; subcategory?: string; confidence: number; tags: string[] } | null = null;

      for (const rule of rules) {
        const matchedKeywords = rule.keywords.filter(k => itemLower.includes(k));
        if (matchedKeywords.length > 0) {
          const confidence = Math.min(0.95, 0.5 + matchedKeywords.length * 0.15);
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = {
              category: rule.category,
              subcategory: rule.subcategory,
              confidence,
              tags: matchedKeywords
            };
          }
        }
      }

      results.push({
        id: typeof item === "string" ? item : item.id || crypto.randomUUID(),
        category: bestMatch?.category || "uncategorized",
        subcategory: bestMatch?.subcategory,
        confidence: bestMatch?.confidence || 0.1,
        tags: bestMatch?.tags || []
      });
    }

    // Calculate category distribution
    const distribution: Record<string, number> = {};
    results.forEach(r => {
      distribution[r.category] = (distribution[r.category] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        results,
        distribution,
        metadata: {
          itemsProcessed: items.length,
          itemType,
          categorized: results.filter(r => r.category !== "uncategorized").length,
          generatedAt: new Date().toISOString()
        }
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
