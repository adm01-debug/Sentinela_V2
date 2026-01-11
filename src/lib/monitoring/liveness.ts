export function livenessProbe(): { alive: boolean; uptime: number } {
  return { alive: true, uptime: process.uptime?.() || 0 };
}
