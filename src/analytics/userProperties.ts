export function setUserProperties(userId: string, properties: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', 'user_properties', { user_id: userId, ...properties });
  }
  console.log('[UserProperties]', userId, properties);
}

export function identifyUser(userId: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', import.meta.env.VITE_GA_ID, { user_id: userId });
  }
}
