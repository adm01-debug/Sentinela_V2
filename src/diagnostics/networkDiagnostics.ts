export interface NetworkDiagnostics { effectiveType: string; downlink: number; rtt: number; saveData: boolean; }
export function getNetworkDiagnostics(): NetworkDiagnostics {
  const conn = (navigator as any).connection || {};
  return { effectiveType: conn.effectiveType || 'unknown', downlink: conn.downlink || 0, rtt: conn.rtt || 0, saveData: conn.saveData || false };
}
