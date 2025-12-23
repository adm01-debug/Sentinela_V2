class SystemMetrics {
  getCpuCores(): number { return navigator.hardwareConcurrency || 1; }
  getMemoryInfo(): { total?: number; used?: number } { const mem = (performance as any).memory; return mem ? { total: mem.jsHeapSizeLimit, used: mem.usedJSHeapSize } : {}; }
  getConnectionInfo(): { type?: string; downlink?: number } { const conn = (navigator as any).connection; return conn ? { type: conn.effectiveType, downlink: conn.downlink } : {}; }
  getBrowserInfo(): { name: string; version: string } { const ua = navigator.userAgent; let name = 'Unknown', version = '0'; if (ua.includes('Chrome')) { name = 'Chrome'; version = ua.match(/Chrome\/(\d+)/)?.[1] || '0'; } else if (ua.includes('Firefox')) { name = 'Firefox'; version = ua.match(/Firefox\/(\d+)/)?.[1] || '0'; } return { name, version }; }
  getScreenInfo(): { width: number; height: number; pixelRatio: number } { return { width: screen.width, height: screen.height, pixelRatio: window.devicePixelRatio }; }
}
export const systemMetrics = new SystemMetrics();
