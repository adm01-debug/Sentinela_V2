export const unitConverter = {
  bytesToKB: (bytes: number): number => bytes / 1024,
  bytesToMB: (bytes: number): number => bytes / (1024 * 1024),
  bytesToGB: (bytes: number): number => bytes / (1024 * 1024 * 1024),
  KBtoBytes: (kb: number): number => kb * 1024,
  MBtoBytes: (mb: number): number => mb * 1024 * 1024,
  formatBytes: (bytes: number): string => { if (bytes < 1024) return bytes + ' B'; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'; if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'; return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'; },
  mToKm: (m: number): number => m / 1000,
  kmToM: (km: number): number => km * 1000,
};
