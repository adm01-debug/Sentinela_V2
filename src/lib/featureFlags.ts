/**
 * Feature Flags — runtime toggles for gradual rollouts and graceful degradation.
 * Flags can be configured via the monitoring_settings table or localStorage for dev.
 */

import { supabase } from "@/integrations/supabase/client";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
}

const LOCAL_FLAGS_KEY = "sentinela_feature_flags";
let cachedFlags: Record<string, boolean> = {};
let lastFetch = 0;
const CACHE_TTL_MS = 60000; // 1 minute

/**
 * Load feature flags from monitoring_settings or localStorage fallback
 */
export async function loadFeatureFlags(): Promise<Record<string, boolean>> {
  if (Date.now() - lastFetch < CACHE_TTL_MS && Object.keys(cachedFlags).length > 0) {
    return cachedFlags;
  }

  try {
    const { data } = await supabase
      .from("monitoring_settings")
      .select("setting_key, setting_value")
      .like("setting_key", "feature_%");

    if (data) {
      cachedFlags = {};
      for (const row of data) {
        cachedFlags[row.setting_key.replace("feature_", "")] = row.setting_value === "true";
      }
    }
  } catch {
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(LOCAL_FLAGS_KEY);
      if (stored) cachedFlags = JSON.parse(stored);
    } catch {
      /* ignore */
    }
  }

  lastFetch = Date.now();
  return cachedFlags;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(key: string, defaultValue = false): boolean {
  return cachedFlags[key] ?? defaultValue;
}

/**
 * Set a feature flag (dev only — persists to localStorage)
 */
export function setFeatureFlag(key: string, enabled: boolean): void {
  cachedFlags[key] = enabled;
  try {
    localStorage.setItem(LOCAL_FLAGS_KEY, JSON.stringify(cachedFlags));
  } catch {
    /* ignore */
  }
}

/**
 * Default feature flags for the system
 */
export const FEATURE_FLAGS = {
  MFA_ENABLED: "mfa_enabled",
  AI_ANALYSIS: "ai_analysis",
  GEOFENCING: "geofencing",
  GAMIFICATION: "gamification",
  MOBILE_TRACKING: "mobile_tracking",
  REALTIME_MONITORING: "realtime_monitoring",
  WHATSAPP_NOTIFICATIONS: "whatsapp_notifications",
  SLACK_NOTIFICATIONS: "slack_notifications",
  OCR_SCREENSHOTS: "ocr_screenshots",
} as const;
