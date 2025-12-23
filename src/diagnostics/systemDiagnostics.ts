export interface SystemDiagnostics { browser: string; os: string; screenResolution: string; language: string; timezone: string; cookiesEnabled: boolean; onLine: boolean; }
export function getSystemDiagnostics(): SystemDiagnostics {
  const ua = navigator.userAgent;
  return { browser: ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Other', os: navigator.platform, screenResolution: screen.width + 'x' + screen.height, language: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, cookiesEnabled: navigator.cookieEnabled, onLine: navigator.onLine };
}
