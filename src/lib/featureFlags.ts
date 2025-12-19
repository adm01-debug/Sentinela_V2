// ============================================================
// FEATURE FLAGS SYSTEM
// Simple feature flag implementation with localStorage override
// ============================================================

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// ============================================================
// TYPES
// ============================================================

export interface FeatureFlags {
  // Monitoring features
  gamification: boolean;
  aiAnalysis: boolean;
  mobileMonitoring: boolean;
  advancedReports: boolean;
  
  // UI features
  darkMode: boolean;
  compactSidebar: boolean;
  betaFeatures: boolean;
  
  // Integrations
  whatsappIntegration: boolean;
  slackIntegration: boolean;
  webhooks: boolean;
  
  // Security
  twoFactorAuth: boolean;
  ssoLogin: boolean;
  auditLogs: boolean;
}

type FeatureFlagKey = keyof FeatureFlags;

// ============================================================
// DEFAULT FLAGS
// ============================================================

const DEFAULT_FLAGS: FeatureFlags = {
  // Monitoring features
  gamification: true,
  aiAnalysis: true,
  mobileMonitoring: true,
  advancedReports: false,
  
  // UI features
  darkMode: true,
  compactSidebar: true,
  betaFeatures: false,
  
  // Integrations
  whatsappIntegration: true,
  slackIntegration: false,
  webhooks: true,
  
  // Security
  twoFactorAuth: false,
  ssoLogin: false,
  auditLogs: true,
};

// ============================================================
// ENVIRONMENT OVERRIDES
// ============================================================

function getEnvFlags(): Partial<FeatureFlags> {
  const envFlags: Partial<FeatureFlags> = {};

  // Map environment variables to flags
  const envMappings: Record<string, FeatureFlagKey> = {
    VITE_ENABLE_GAMIFICATION: 'gamification',
    VITE_ENABLE_AI_ANALYSIS: 'aiAnalysis',
    VITE_ENABLE_MOBILE_MONITORING: 'mobileMonitoring',
    VITE_ENABLE_BETA_FEATURES: 'betaFeatures',
    VITE_ENABLE_WHATSAPP: 'whatsappIntegration',
    VITE_ENABLE_SLACK: 'slackIntegration',
    VITE_ENABLE_2FA: 'twoFactorAuth',
    VITE_ENABLE_SSO: 'ssoLogin',
  };

  for (const [envKey, flagKey] of Object.entries(envMappings)) {
    const value = import.meta.env[envKey];
    if (value !== undefined) {
      envFlags[flagKey] = value === 'true';
    }
  }

  return envFlags;
}

// ============================================================
// LOCAL STORAGE OVERRIDES
// ============================================================

const STORAGE_KEY = 'sentinela-feature-flags';

function getLocalStorageFlags(): Partial<FeatureFlags> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[FeatureFlags] Error reading from localStorage:', error);
  }
  return {};
}

function setLocalStorageFlags(flags: Partial<FeatureFlags>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch (error) {
    console.error('[FeatureFlags] Error writing to localStorage:', error);
  }
}

// ============================================================
// FEATURE FLAGS SERVICE
// ============================================================

class FeatureFlagsService {
  private flags: FeatureFlags;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Merge flags: defaults < env < localStorage
    this.flags = {
      ...DEFAULT_FLAGS,
      ...getEnvFlags(),
      ...getLocalStorageFlags(),
    };
  }

  get(key: FeatureFlagKey): boolean {
    return this.flags[key];
  }

  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  set(key: FeatureFlagKey, value: boolean) {
    this.flags[key] = value;
    
    // Persist override to localStorage
    const overrides = getLocalStorageFlags();
    overrides[key] = value;
    setLocalStorageFlags(overrides);
    
    // Notify listeners
    this.notifyListeners();
  }

  reset(key?: FeatureFlagKey) {
    if (key) {
      // Reset single flag
      this.flags[key] = DEFAULT_FLAGS[key];
      
      const overrides = getLocalStorageFlags();
      delete overrides[key];
      setLocalStorageFlags(overrides);
    } else {
      // Reset all flags
      this.flags = { ...DEFAULT_FLAGS, ...getEnvFlags() };
      localStorage.removeItem(STORAGE_KEY);
    }
    
    this.notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagsService();

// ============================================================
// REACT CONTEXT
// ============================================================

interface FeatureFlagsContextValue {
  flags: FeatureFlags;
  isEnabled: (key: FeatureFlagKey) => boolean;
  setFlag: (key: FeatureFlagKey, value: boolean) => void;
  resetFlags: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(() => featureFlags.getAll());

  useEffect(() => {
    return featureFlags.subscribe(() => {
      setFlags(featureFlags.getAll());
    });
  }, []);

  const value: FeatureFlagsContextValue = {
    flags,
    isEnabled: (key) => flags[key],
    setFlag: (key, value) => featureFlags.set(key, value),
    resetFlags: () => featureFlags.reset(),
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// ============================================================
// HOOKS
// ============================================================

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
}

export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}

// ============================================================
// COMPONENT WRAPPER
// ============================================================

interface FeatureProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Feature({ flag, children, fallback = null }: FeatureProps) {
  const isEnabled = useFeatureFlag(flag);
  return <>{isEnabled ? children : fallback}</>;
}

// ============================================================
// EXPORTS
// ============================================================

export type { FeatureFlagKey };
export { DEFAULT_FLAGS };
