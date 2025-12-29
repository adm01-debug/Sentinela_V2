declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

interface UserProperties {
  user_id?: string;
  user_type?: 'free' | 'premium' | 'enterprise';
  organization_id?: string;
  plan?: string;
  [key: string]: string | number | boolean | undefined;
}

export function setUserProperties(userId: string, properties: Omit<UserProperties, 'user_id'> = {}): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const userProps: UserProperties = {
    user_id: userId,
    ...properties,
  };
  
  window.gtag('set', 'user_properties', userProps);
}

export function setUserId(userId: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const gaId = import.meta.env.VITE_GA_ID;
  if (!gaId) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] VITE_GA_ID not configured');
    }
    return;
  }
  
  window.gtag('config', gaId, { user_id: userId });
}

export function clearUserId(): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const gaId = import.meta.env.VITE_GA_ID;
  if (!gaId) return;
  
  window.gtag('config', gaId, { user_id: undefined });
}

export function setUserType(userType: UserProperties['user_type']): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('set', 'user_properties', { user_type: userType });
}

export type { UserProperties };
