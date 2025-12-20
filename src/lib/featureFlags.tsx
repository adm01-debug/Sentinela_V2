import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

// ============================================================
// TYPES
// ============================================================

interface FeatureFlags {
  // Core features
  darkMode: boolean;
  advancedAnalytics: boolean;
  realtimeNotifications: boolean;
  
  // Monitoring features
  screenshotCapture: boolean;
  keystrokeLogging: boolean;
  applicationTracking: boolean;
  geofencing: boolean;
  mobileMonitoring: boolean;
  
  // Beta features
  aiAssistant: boolean;
  predictiveAlerts: boolean;
  customDashboards: boolean;
  gamification: boolean;
  productivityScoring: boolean;
  
  // Communication features
  whatsappIntegration: boolean;
  emailReports: boolean;
  webhooks: boolean;
  
  // Experimental features
  voiceCommands: boolean;
  biometricAuth: boolean;
  offlineMode: boolean;
  ocrProcessing: boolean;
  sessionPlayback: boolean;
}

// ============================================================
// DEFAULT FLAGS
// ============================================================

const defaultFlags: FeatureFlags = {
  // Core features - enabled by default
  darkMode: true,
  advancedAnalytics: true,
  realtimeNotifications: true,
  
  // Monitoring features - enabled by default
  screenshotCapture: true,
  keystrokeLogging: true,
  applicationTracking: true,
  geofencing: true,
  mobileMonitoring: true,
  
  // Beta features - some enabled
  aiAssistant: true,
  predictiveAlerts: false,
  customDashboards: true,
  gamification: true,
  productivityScoring: true,
  
  // Communication features - enabled
  whatsappIntegration: true,
  emailReports: true,
  webhooks: true,
  
  // Experimental features - disabled by default
  voiceCommands: false,
  biometricAuth: false,
  offlineMode: false,
  ocrProcessing: false,
  sessionPlayback: false,
};

// ============================================================
// CONTEXT
// ============================================================

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================

interface FeatureFlagsProviderProps {
  children: ReactNode;
  initialFlags?: Partial<FeatureFlags>;
}

export function FeatureFlagsProvider({ children, initialFlags }: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<FeatureFlags>({
    ...defaultFlags,
    ...initialFlags,
  });

  const isEnabled = useCallback(
    (feature: keyof FeatureFlags) => flags[feature],
    [flags]
  );

  const setFlag = useCallback(
    (feature: keyof FeatureFlags, enabled: boolean) => {
      setFlags((prev) => ({ ...prev, [feature]: enabled }));
    },
    []
  );

  const enableFlag = useCallback(
    (feature: keyof FeatureFlags) => setFlag(feature, true),
    [setFlag]
  );

  const disableFlag = useCallback(
    (feature: keyof FeatureFlags) => setFlag(feature, false),
    [setFlag]
  );

  const toggleFlag = useCallback(
    (feature: keyof FeatureFlags) => {
      setFlags((prev) => ({ ...prev, [feature]: !prev[feature] }));
    },
    []
  );

  const value = useMemo(
    () => ({
      flags,
      isEnabled,
      setFlag,
      enableFlag,
      disableFlag,
      toggleFlag,
    }),
    [flags, isEnabled, setFlag, enableFlag, disableFlag, toggleFlag]
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
}

// ============================================================
// SINGLE FLAG HOOK
// ============================================================

export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(feature);
}

// ============================================================
// CONDITIONAL COMPONENT
// ============================================================

interface FeatureProps {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Feature({ feature, children, fallback = null }: FeatureProps) {
  const isEnabled = useFeatureFlag(feature);
  return <>{isEnabled ? children : fallback}</>;
}

// ============================================================
// EXPORTS
// ============================================================

export type { FeatureFlags, FeatureFlagsContextType };
