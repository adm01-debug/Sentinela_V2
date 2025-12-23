export const timeConverter = {
  secondsToMinutes: (s: number): number => s / 60,
  minutesToSeconds: (m: number): number => m * 60,
  secondsToHours: (s: number): number => s / 3600,
  hoursToSeconds: (h: number): number => h * 3600,
  msToSeconds: (ms: number): number => ms / 1000,
  secondsToMs: (s: number): number => s * 1000,
  formatDuration: (seconds: number): string => { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); const s = Math.floor(seconds % 60); return [h, m, s].map(v => String(v).padStart(2, '0')).join(':'); },
  parseDuration: (str: string): number => { const [h, m, s] = str.split(':').map(Number); return h * 3600 + m * 60 + s; },
};
